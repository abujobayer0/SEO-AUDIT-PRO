const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { URL } = require("url");

class SEOAuditService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
        ],
      });
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  normalizeUrl(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    return url;
  }

  async runLighthouseAudit(url) {
    let chrome = null;
    try {
      console.log(`Starting Lighthouse audit for: ${url}`);

      // Dynamic imports for ES Modules
      const lighthouse = (await import("lighthouse")).default;
      const chromeLauncher = await import("chrome-launcher");

      // Launch Chrome
      chrome = await chromeLauncher.launch({
        chromeFlags: ["--headless", "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
      });

      // Lighthouse options
      const options = {
        logLevel: "error",
        output: "json",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        port: chrome.port,
        disableDeviceEmulation: false,
        throttlingMethod: "simulate",
        emulatedFormFactor: "desktop",
      };

      // Run Lighthouse
      const runnerResult = await lighthouse(url, options);

      if (!runnerResult || !runnerResult.lhr) {
        throw new Error("Lighthouse audit failed to return results");
      }

      const { lhr } = runnerResult;
      console.log(`Lighthouse audit completed for ${url}`);

      // Extract Core Web Vitals and key metrics
      const metrics = lhr.audits;
      const categories = lhr.categories;

      return {
        performance: {
          score: Math.round((categories.performance?.score || 0) * 100),
          metrics: {
            firstContentfulPaint: metrics["first-contentful-paint"]?.numericValue || 0,
            largestContentfulPaint: metrics["largest-contentful-paint"]?.numericValue || 0,
            cumulativeLayoutShift: metrics["cumulative-layout-shift"]?.numericValue || 0,
            firstInputDelay: metrics["first-input-delay"]?.numericValue || 0,
            speedIndex: metrics["speed-index"]?.numericValue || 0,
            totalBlockingTime: metrics["total-blocking-time"]?.numericValue || 0,
            timeToInteractive: metrics["interactive"]?.numericValue || 0,
          },
          opportunities: (lhr.categories.performance?.auditRefs || [])
            .filter((ref) => lhr.audits[ref.id]?.details?.type === "opportunity")
            .map((ref) => ({
              title: lhr.audits[ref.id].title,
              description: lhr.audits[ref.id].description,
              savings: lhr.audits[ref.id].details?.overallSavingsMs || 0,
            }))
            .slice(0, 5),
        },
        accessibility: {
          score: Math.round((categories.accessibility?.score || 0) * 100),
          issues: (lhr.categories.accessibility?.auditRefs || [])
            .filter((ref) => lhr.audits[ref.id]?.score < 1)
            .map((ref) => lhr.audits[ref.id].title)
            .slice(0, 10),
        },
        seo: {
          score: Math.round((categories.seo?.score || 0) * 100),
          issues: (lhr.categories.seo?.auditRefs || [])
            .filter((ref) => lhr.audits[ref.id]?.score < 1)
            .map((ref) => lhr.audits[ref.id].title)
            .slice(0, 10),
        },
        bestPractices: {
          score: Math.round((categories["best-practices"]?.score || 0) * 100),
          issues: (lhr.categories["best-practices"]?.auditRefs || [])
            .filter((ref) => lhr.audits[ref.id]?.score < 1)
            .map((ref) => lhr.audits[ref.id].title)
            .slice(0, 10),
        },
      };
    } catch (error) {
      console.error("Lighthouse audit error:", error.message);
      return {
        performance: { score: 0, metrics: {}, opportunities: [] },
        accessibility: { score: 0, issues: [] },
        seo: { score: 0, issues: [] },
        bestPractices: { score: 0, issues: [] },
      };
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  }

  async auditWebsite(url) {
    try {
      await this.initBrowser();
      url = this.normalizeUrl(url);

      const page = await this.browser.newPage();

      // Comprehensive page setup
      await page.setViewport({ width: 1366, height: 768 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );
      await page.setExtraHTTPHeaders({
        "accept-language": "en-US,en;q=0.9",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-encoding": "gzip, deflate, br",
        "cache-control": "no-cache",
        pragma: "no-cache",
      });

      // Bypass CSP and security restrictions
      await page.setBypassCSP(true);
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      });

      // Navigate with multiple strategies
      let pageContent = "";
      let pageData = {};

      try {
        console.log(`Navigating to: ${url}`);
        await page.goto(url, {
          waitUntil: ["networkidle0", "domcontentloaded"],
          timeout: 4500000,
        });

        // Wait for dynamic content
        await page.waitForTimeout(3000);

        // Try to wait for common content selectors
        await Promise.race([
          page.waitForSelector("h1", { timeout: 5000 }).catch(() => {}),
          page.waitForSelector("title", { timeout: 5000 }).catch(() => {}),
          page.waitForSelector("main", { timeout: 5000 }).catch(() => {}),
          page.waitForTimeout(5000),
        ]);

        pageContent = await page.content();

        // Extract comprehensive page data using evaluate
        pageData = await page.evaluate(() => {
          const getText = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.textContent.trim() : "";
          };

          const getAttr = (selector, attr) => {
            const el = document.querySelector(selector);
            return el ? el.getAttribute(attr) : "";
          };

          const getAllText = (selector) => {
            return Array.from(document.querySelectorAll(selector))
              .map((el) => el.textContent.trim())
              .filter((text) => text.length > 0);
          };

          return {
            title: document.title || "",
            metaDescription: getAttr('meta[name="description"]', "content") || getAttr('meta[property="og:description"]', "content") || "",
            metaKeywords: getAttr('meta[name="keywords"]', "content") || "",
            h1Text: getAllText("h1"),
            h2Text: getAllText("h2"),
            h3Text: getAllText("h3"),
            bodyText: document.body ? document.body.innerText || document.body.textContent || "" : "",
            canonicalUrl: getAttr('link[rel="canonical"]', "href") || "",
            ogTitle: getAttr('meta[property="og:title"]', "content") || "",
            ogDescription: getAttr('meta[property="og:description"]', "content") || "",
            ogImage: getAttr('meta[property="og:image"]', "content") || "",
            viewport: getAttr('meta[name="viewport"]', "content") || "",
            robots: getAttr('meta[name="robots"]', "content") || "",
            structuredData: Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
              .map((script) => script.textContent.trim())
              .filter(Boolean),
            images: Array.from(document.querySelectorAll("img")).map((img) => ({
              src: img.src || img.getAttribute("data-src") || "",
              alt: img.alt || "",
              title: img.title || "",
              width: img.naturalWidth || img.width || 0,
              height: img.naturalHeight || img.height || 0,
              loading: img.loading || img.getAttribute("loading") || "auto",
              className: img.className || "",
              id: img.id || "",
            })),
            links: Array.from(document.querySelectorAll("a[href]")).map((link) => ({
              href: link.href,
              text: link.textContent.trim(),
              title: link.title || "",
              rel: link.rel || "",
              target: link.target || "",
              className: link.className || "",
              id: link.id || "",
            })),
            performance: {
              loadTime: performance.timing ? performance.timing.loadEventEnd - performance.timing.loadEventStart : 0,
              domContentLoaded: performance.timing
                ? performance.timing.domContentLoadedEventEnd - performance.timing.domContentLoadedEventStart
                : 0,
              firstPaint: performance.getEntriesByType
                ? performance.getEntriesByType("paint").find((p) => p.name === "first-paint")?.startTime || 0
                : 0,
              firstContentfulPaint: performance.getEntriesByType
                ? performance.getEntriesByType("paint").find((p) => p.name === "first-contentful-paint")?.startTime || 0
                : 0,
            },
            socialMedia: {
              twitterCard: getAttr('meta[name="twitter:card"]', "content") || "",
              twitterSite: getAttr('meta[name="twitter:site"]', "content") || "",
              twitterCreator: getAttr('meta[name="twitter:creator"]', "content") || "",
              facebookAppId: getAttr('meta[property="fb:app_id"]', "content") || "",
            },
            analytics: {
              googleAnalytics: Array.from(document.querySelectorAll("script")).some(
                (script) =>
                  script.src.includes("google-analytics.com") ||
                  script.src.includes("gtag") ||
                  script.textContent.includes("gtag") ||
                  script.textContent.includes("ga(")
              ),
              googleTagManager: Array.from(document.querySelectorAll("script")).some(
                (script) => script.src.includes("googletagmanager.com") || script.textContent.includes("GTM-")
              ),
              facebookPixel: Array.from(document.querySelectorAll("script")).some((script) => script.textContent.includes("fbq(")),
            },
            security: {
              httpsRedirect: window.location.protocol === "https:",
              hsts: !!document.querySelector('meta[http-equiv="Strict-Transport-Security"]'),
              csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
            },
            accessibility: {
              altTexts: Array.from(document.querySelectorAll("img")).filter((img) => !img.alt).length,
              skipLinks: Array.from(document.querySelectorAll('a[href^="#"]')).filter((link) =>
                link.textContent.toLowerCase().includes("skip")
              ).length,
              ariaLabels: Array.from(document.querySelectorAll("[aria-label]")).length,
              headingStructure: {
                h1: document.querySelectorAll("h1").length,
                h2: document.querySelectorAll("h2").length,
                h3: document.querySelectorAll("h3").length,
                h4: document.querySelectorAll("h4").length,
                h5: document.querySelectorAll("h5").length,
                h6: document.querySelectorAll("h6").length,
              },
            },
            windowSize: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
            hasTouch: "ontouchstart" in window,
          };
        });

        console.log(`Successfully extracted data for: ${url}`);
      } catch (error) {
        console.error(`Error loading page ${url}:`, error.message);
        // Try fallback with basic fetch
        try {
          const response = await axios.get(url, {
            timeout: 30000,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });
          pageContent = response.data;
          console.log(`Fallback fetch successful for: ${url}`);
        } catch (fallbackError) {
          console.error(`Both Puppeteer and fallback failed for ${url}:`, fallbackError.message);
          throw new Error(`Unable to load website: ${error.message}`);
        }
      }

      const $ = cheerio.load(pageContent);

      // Run Lighthouse audit in parallel with our custom checks
      console.log("Running comprehensive audit checks including Lighthouse...");

      const [
        lighthouseResults,
        performanceData,
        accessibilityData,
        seoData,
        mobileData,
        technicalData,
        contentData,
        metaData,
        imageData,
        linkData,
      ] = await Promise.all([
        this.runLighthouseAudit(url),
        this.checkPerformance(pageData, page),
        this.checkAccessibility($, pageData),
        this.checkSEO($, pageData, url),
        this.checkMobileFriendly(pageData, page),
        this.checkTechnical($, pageData, url),
        this.checkContent($, pageData),
        this.checkMetaTags($, pageData),
        this.checkImages($, pageData),
        this.checkLinks($, pageData, url),
      ]);

      await page.close();

      // Merge Lighthouse results with our custom analysis
      const enhancedPerformance = {
        ...performanceData,
        lighthouseScore: lighthouseResults.performance.score,
        coreWebVitals: {
          firstContentfulPaint: lighthouseResults.performance.metrics.firstContentfulPaint,
          largestContentfulPaint: lighthouseResults.performance.metrics.largestContentfulPaint,
          cumulativeLayoutShift: lighthouseResults.performance.metrics.cumulativeLayoutShift,
          firstInputDelay: lighthouseResults.performance.metrics.firstInputDelay,
          speedIndex: lighthouseResults.performance.metrics.speedIndex,
          totalBlockingTime: lighthouseResults.performance.metrics.totalBlockingTime,
          timeToInteractive: lighthouseResults.performance.metrics.timeToInteractive,
        },
        opportunities: lighthouseResults.performance.opportunities,
        // Use Lighthouse score if it's available and seems more accurate
        score:
          lighthouseResults.performance.score > 0
            ? Math.round((lighthouseResults.performance.score + performanceData.score) / 2)
            : performanceData.score,
      };

      const enhancedAccessibility = {
        ...accessibilityData,
        lighthouseScore: lighthouseResults.accessibility.score,
        lighthouseIssues: lighthouseResults.accessibility.issues,
        // Combine scores for more comprehensive assessment
        score:
          lighthouseResults.accessibility.score > 0
            ? Math.round((lighthouseResults.accessibility.score + accessibilityData.score) / 2)
            : accessibilityData.score,
      };

      const enhancedSEO = {
        ...seoData,
        lighthouseScore: lighthouseResults.seo.score,
        lighthouseIssues: lighthouseResults.seo.issues,
        // Combine scores
        score: lighthouseResults.seo.score > 0 ? Math.round((lighthouseResults.seo.score + seoData.score) / 2) : seoData.score,
      };

      // Calculate overall score with weighted averages using enhanced scores
      const scores = [
        { score: enhancedPerformance.score, weight: 0.25 },
        { score: enhancedAccessibility.score, weight: 0.15 },
        { score: enhancedSEO.score, weight: 0.25 },
        { score: mobileData.score, weight: 0.15 },
        { score: technicalData.score, weight: 0.1 },
        { score: contentData.score, weight: 0.1 },
      ];

      const overallScore = Math.round(scores.reduce((sum, { score, weight }) => sum + score * weight, 0));

      const result = {
        overallScore,
        performance: enhancedPerformance,
        accessibility: enhancedAccessibility,
        seo: enhancedSEO,
        mobileFriendly: mobileData,
        technical: technicalData,
        content: contentData,
        metaTags: metaData,
        images: imageData,
        links: linkData,
        pageSpeed: {
          loadTime: pageData.performance?.loadTime || 0,
          firstContentfulPaint: enhancedPerformance.coreWebVitals?.firstContentfulPaint || 0,
          largestContentfulPaint: enhancedPerformance.coreWebVitals?.largestContentfulPaint || 0,
          cumulativeLayoutShift: enhancedPerformance.coreWebVitals?.cumulativeLayoutShift || 0,
          firstInputDelay: enhancedPerformance.coreWebVitals?.firstInputDelay || 0,
          speedIndex: enhancedPerformance.coreWebVitals?.speedIndex || 0,
          totalBlockingTime: enhancedPerformance.coreWebVitals?.totalBlockingTime || 0,
          timeToInteractive: enhancedPerformance.coreWebVitals?.timeToInteractive || 0,
          issues: enhancedPerformance.issues || [],
        },
        lighthouse: {
          performance: lighthouseResults.performance,
          accessibility: lighthouseResults.accessibility,
          seo: lighthouseResults.seo,
          bestPractices: lighthouseResults.bestPractices,
        },
      };

      console.log(`Audit completed for ${url} with score: ${overallScore}`);
      return result;
    } catch (error) {
      console.error("Audit error:", error);
      throw new Error(`Failed to audit website: ${error.message}`);
    }
  }

  async checkPerformance(pageData, page) {
    try {
      const issues = [];
      const suggestions = [];
      let score = 100;

      const loadTime = pageData.performance?.loadTime || 0;
      const firstPaint = pageData.performance?.firstPaint || 0;
      const firstContentfulPaint = pageData.performance?.firstContentfulPaint || 0;

      // Enhanced performance analysis with realistic metrics
      const performanceMetrics = await this.analyzePerformanceMetrics(page, pageData);

      // Check load time with more granular analysis
      if (loadTime > 5000) {
        score -= 30;
        issues.push("Page load time is extremely slow (over 5 seconds)");
        suggestions.push("Implement critical performance optimizations: compress images, enable caching, optimize server response time");
      } else if (loadTime > 3000) {
        score -= 25;
        issues.push("Page load time is over 3 seconds");
        suggestions.push("Optimize images, minify CSS/JS, and reduce server response time");
      } else if (loadTime > 2000) {
        score -= 15;
        issues.push("Page load time could be improved");
        suggestions.push("Consider optimizing images and reducing resource sizes");
      } else if (loadTime > 1000) {
        score -= 5;
        issues.push("Page load time is acceptable but could be faster");
        suggestions.push("Fine-tune performance with advanced optimization techniques");
      }

      // Check First Contentful Paint with realistic thresholds
      if (firstContentfulPaint > 2500) {
        score -= 25;
        issues.push("First Contentful Paint is very slow (over 2.5 seconds)");
        suggestions.push("Optimize critical rendering path, reduce render-blocking resources, and improve server response time");
      } else if (firstContentfulPaint > 1800) {
        score -= 20;
        issues.push("First Contentful Paint is over 1.8 seconds");
        suggestions.push("Optimize critical rendering path and reduce render-blocking resources");
      } else if (firstContentfulPaint > 1200) {
        score -= 10;
        issues.push("First Contentful Paint could be improved");
        suggestions.push("Consider optimizing above-the-fold content loading");
      }

      // Enhanced resource analysis
      if (page) {
        try {
          const resourceAnalysis = await page.evaluate(() => {
            const resources = performance.getEntriesByType("resource");
            const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
            const imageResources = resources.filter((r) => r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));
            const cssResources = resources.filter((r) => r.name.match(/\.css$/i));
            const jsResources = resources.filter((r) => r.name.match(/\.js$/i));

            return {
              totalCount: resources.length,
              totalSize: totalSize,
              imageCount: imageResources.length,
              cssCount: cssResources.length,
              jsCount: jsResources.length,
              imageSize: imageResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
              cssSize: cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
              jsSize: jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
            };
          });

          // Check resource count
          if (resourceAnalysis.totalCount > 150) {
            score -= 15;
            issues.push(`High number of HTTP requests (${resourceAnalysis.totalCount})`);
            suggestions.push("Combine CSS/JS files, use image sprites, and implement resource bundling");
          } else if (resourceAnalysis.totalCount > 100) {
            score -= 10;
            issues.push(`Moderate number of HTTP requests (${resourceAnalysis.totalCount})`);
            suggestions.push("Consider combining resources and optimizing asset delivery");
          }

          // Check total page size
          const totalSizeMB = resourceAnalysis.totalSize / (1024 * 1024);
          if (totalSizeMB > 5) {
            score -= 20;
            issues.push(`Page size is very large (${totalSizeMB.toFixed(1)}MB)`);
            suggestions.push("Compress images, minify code, and remove unused resources");
          } else if (totalSizeMB > 3) {
            score -= 10;
            issues.push(`Page size could be optimized (${totalSizeMB.toFixed(1)}MB)`);
            suggestions.push("Consider compressing images and optimizing resource sizes");
          }

          // Check image optimization
          const imageSizeMB = resourceAnalysis.imageSize / (1024 * 1024);
          if (imageSizeMB > 2) {
            score -= 15;
            issues.push(`Images are too large (${imageSizeMB.toFixed(1)}MB)`);
            suggestions.push("Compress images, use modern formats (WebP), and implement lazy loading");
          }

          // Check CSS optimization
          const cssSizeKB = resourceAnalysis.cssSize / 1024;
          if (cssSizeKB > 500) {
            score -= 10;
            issues.push(`CSS files are large (${cssSizeKB.toFixed(1)}KB)`);
            suggestions.push("Minify CSS, remove unused styles, and split into critical/non-critical");
          }

          // Check JavaScript optimization
          const jsSizeKB = resourceAnalysis.jsSize / 1024;
          if (jsSizeKB > 1000) {
            score -= 15;
            issues.push(`JavaScript files are very large (${jsSizeKB.toFixed(1)}KB)`);
            suggestions.push("Minify JavaScript, remove unused code, and implement code splitting");
          } else if (jsSizeKB > 500) {
            score -= 10;
            issues.push(`JavaScript files could be optimized (${jsSizeKB.toFixed(1)}KB)`);
            suggestions.push("Consider minifying and bundling JavaScript files");
          }
        } catch (e) {
          console.log("Performance API not available, using fallback analysis");
        }
      }

      // Add caching analysis
      if (page) {
        try {
          const cachingAnalysis = await page.evaluate(() => {
            const resources = performance.getEntriesByType("resource");
            const cachedResources = resources.filter((r) => r.transferSize === 0);
            const cacheHitRate = resources.length > 0 ? (cachedResources.length / resources.length) * 100 : 0;

            return {
              cacheHitRate: cacheHitRate,
              cachedCount: cachedResources.length,
              totalResources: resources.length,
            };
          });

          if (cachingAnalysis.cacheHitRate < 20) {
            score -= 10;
            issues.push("Low cache hit rate - resources not being cached effectively");
            suggestions.push("Implement proper caching headers and CDN for static resources");
          }
        } catch (e) {
          // Ignore caching analysis errors
        }
      }

      return {
        score: Math.max(0, score),
        issues,
        suggestions,
        loadTime,
        firstPaint,
        firstContentfulPaint,
        metrics: performanceMetrics,
      };
    } catch (error) {
      return {
        score: 50,
        issues: ["Performance check failed"],
        suggestions: ["Unable to measure performance accurately"],
      };
    }
  }

  async analyzePerformanceMetrics(page, pageData) {
    try {
      if (!page) return {};

      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        const paintEntries = performance.getEntriesByType("paint");

        const firstPaint = paintEntries.find((entry) => entry.name === "first-paint");
        const firstContentfulPaint = paintEntries.find((entry) => entry.name === "first-contentful-paint");

        return {
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          loadComplete: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          firstPaint: firstPaint ? firstPaint.startTime : 0,
          firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
          domInteractive: navigation ? navigation.domInteractive - navigation.fetchStart : 0,
          redirectTime: navigation ? navigation.redirectEnd - navigation.redirectStart : 0,
          dnsTime: navigation ? navigation.domainLookupEnd - navigation.domainLookupStart : 0,
          tcpTime: navigation ? navigation.connectEnd - navigation.connectStart : 0,
          requestTime: navigation ? navigation.responseStart - navigation.requestStart : 0,
          responseTime: navigation ? navigation.responseEnd - navigation.responseStart : 0,
        };
      });

      return metrics;
    } catch (error) {
      console.log("Error analyzing performance metrics:", error.message);
      return {};
    }
  }

  async checkAccessibility($, pageData) {
    const issues = [];
    const suggestions = [];
    let score = 100;

    // Check for alt attributes on images
    const imagesWithoutAlt = (pageData.images || []).filter((img) => !img.alt).length;
    if (imagesWithoutAlt > 0) {
      const penalty = Math.min(30, imagesWithoutAlt * 5);
      score -= penalty;
      issues.push(`${imagesWithoutAlt} images missing alt attributes`);
      suggestions.push("Add descriptive alt attributes to all images");
    }

    // Check for heading hierarchy
    const h1Count = (pageData.h1Text || []).length;
    if (h1Count === 0) {
      score -= 25;
      issues.push("No H1 tag found");
      suggestions.push("Add a single H1 tag to your page");
    } else if (h1Count > 1) {
      score -= 15;
      issues.push("Multiple H1 tags found");
      suggestions.push("Use only one H1 tag per page");
    }

    // Check for form labels (basic check)
    const inputsWithoutLabels = $("input:not([aria-label]):not([aria-labelledby])").filter(function () {
      return !$(this).closest("label").length && !$(this).attr("placeholder");
    }).length;

    if (inputsWithoutLabels > 0) {
      score -= inputsWithoutLabels * 10;
      issues.push(`${inputsWithoutLabels} form inputs missing labels`);
      suggestions.push("Add labels or aria-labels to all form inputs");
    }

    // Check for skip links
    const hasSkipLinks =
      $('a[href^="#"]').filter(function () {
        return $(this).text().toLowerCase().includes("skip");
      }).length > 0;

    if (!hasSkipLinks && $("nav").length > 0) {
      score -= 5;
      issues.push("No skip navigation links found");
      suggestions.push("Add skip links for keyboard navigation");
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  async checkSEO($, pageData, url) {
    const issues = [];
    const suggestions = [];
    let score = 100;

    const title = pageData.title || "";
    const metaDescription = pageData.metaDescription || "";

    // Check title tag
    if (!title) {
      score -= 25;
      issues.push("Missing title tag");
      suggestions.push("Add a descriptive title tag");
    } else if (title.length < 30 || title.length > 60) {
      score -= 15;
      issues.push("Title tag length is not optimal (30-60 characters)");
      suggestions.push("Optimize title length to 30-60 characters");
    }

    // Check meta description
    if (!metaDescription) {
      score -= 20;
      issues.push("Missing meta description");
      suggestions.push("Add a compelling meta description");
    } else if (metaDescription.length < 120 || metaDescription.length > 160) {
      score -= 10;
      issues.push("Meta description length is not optimal (120-160 characters)");
      suggestions.push("Optimize meta description length to 120-160 characters");
    }

    // Check H1 tag
    const h1Count = (pageData.h1Text || []).length;
    if (h1Count === 0) {
      score -= 20;
      issues.push("Missing H1 tag");
      suggestions.push("Add a single H1 tag to your page");
    } else if (h1Count > 1) {
      score -= 10;
      issues.push("Multiple H1 tags found");
      suggestions.push("Use only one H1 tag per page");
    }

    // Check for internal linking
    try {
      const hostname = new URL(url).hostname;
      const internalLinks = (pageData.links || []).filter((link) => {
        try {
          return link.href.includes(hostname) || link.href.startsWith("/");
        } catch {
          return false;
        }
      }).length;

      if (internalLinks < 3) {
        score -= 10;
        issues.push("Limited internal linking");
        suggestions.push("Add more internal links to improve site structure");
      }
    } catch (e) {
      // Ignore URL parsing errors
    }

    // Check for Open Graph tags
    if (!pageData.ogTitle && !pageData.ogDescription) {
      score -= 5;
      issues.push("Missing Open Graph tags");
      suggestions.push("Add Open Graph meta tags for social media");
    }

    // Check URL structure
    try {
      const urlObj = new URL(url);
      if (urlObj.pathname.length > 100) {
        score -= 5;
        issues.push("URL is too long");
        suggestions.push("Use shorter, more descriptive URLs");
      }

      if (urlObj.pathname.includes("_") || urlObj.pathname.includes("%")) {
        score -= 5;
        issues.push("URL contains special characters");
        suggestions.push("Use hyphens instead of underscores in URLs");
      }
    } catch (e) {
      // Ignore URL parsing errors
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  async checkMobileFriendly(pageData, page) {
    try {
      const issues = [];
      const suggestions = [];
      let score = 100;

      const viewport = pageData.viewport || "";
      const hasTouch = pageData.hasTouch || false;
      const windowWidth = pageData.windowSize?.width || 1366;

      // Check viewport meta tag
      if (!viewport) {
        score -= 30;
        issues.push("Missing viewport meta tag");
        suggestions.push("Add viewport meta tag for mobile optimization");
      } else if (!viewport.includes("width=device-width")) {
        score -= 20;
        issues.push("Viewport not optimized for mobile");
        suggestions.push("Set viewport width to device-width");
      }

      // Check if content is wider than viewport
      if (page) {
        try {
          const contentWidth = await page.evaluate(() => {
            return Math.max(
              document.body.scrollWidth,
              document.body.offsetWidth,
              document.documentElement.clientWidth,
              document.documentElement.scrollWidth,
              document.documentElement.offsetWidth
            );
          });

          if (contentWidth > windowWidth * 1.1) {
            score -= 15;
            issues.push("Content wider than viewport");
            suggestions.push("Ensure content fits within viewport width");
          }
        } catch (e) {
          // Ignore if evaluation fails
        }
      }

      // Check for mobile-friendly elements
      if (!hasTouch) {
        score -= 10;
        issues.push("Touch events not detected");
        suggestions.push("Ensure touch events are properly handled");
      }

      // Basic font size check (approximation)
      const bodyText = pageData.bodyText || "";
      if (bodyText.length < 100) {
        score -= 5;
        issues.push("Limited content for mobile users");
        suggestions.push("Ensure sufficient content is visible on mobile");
      }

      return {
        score: Math.max(0, score),
        issues,
        suggestions,
      };
    } catch (error) {
      return {
        score: 70,
        issues: ["Mobile check partially failed"],
        suggestions: ["Unable to fully assess mobile compatibility"],
      };
    }
  }

  async checkTechnical($, pageData, url) {
    const issues = [];
    const suggestions = [];
    let score = 100;

    // Check for HTTPS
    try {
      const protocol = new URL(url).protocol;
      if (protocol !== "https:") {
        score -= 25;
        issues.push("Site not using HTTPS");
        suggestions.push("Implement SSL certificate for HTTPS");
      }
    } catch (e) {
      // Ignore URL parsing errors
    }

    // Check for canonical URL
    const canonical = pageData.canonicalUrl || "";
    if (!canonical) {
      score -= 15;
      issues.push("Missing canonical URL");
      suggestions.push("Add canonical URL to prevent duplicate content");
    }

    // Check for robots meta tag
    const robots = pageData.robots || "";
    if (!robots) {
      score -= 10;
      issues.push("Missing robots meta tag");
      suggestions.push("Add robots meta tag for search engine guidance");
    }

    // Check for structured data
    const structuredData = pageData.structuredData || [];
    if (structuredData.length === 0) {
      score -= 15;
      issues.push("No structured data found");
      suggestions.push("Add structured data markup (JSON-LD)");
    }

    // Check for sitemap (basic check)
    const hasSitemapLink = $('link[rel="sitemap"]').length > 0;
    if (!hasSitemapLink) {
      score -= 5;
      issues.push("No sitemap reference found");
      suggestions.push("Add sitemap reference in HTML head");
    }

    // Check for favicon
    const hasFavicon = $('link[rel="icon"], link[rel="shortcut icon"]').length > 0;
    if (!hasFavicon) {
      score -= 5;
      issues.push("Missing favicon");
      suggestions.push("Add a favicon for better user experience");
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  async checkContent($, pageData) {
    const issues = [];
    const suggestions = [];
    let score = 100;

    const bodyText = pageData.bodyText || "";
    const title = pageData.title || "";

    // Enhanced content analysis
    const contentAnalysis = this.analyzeContentQuality(bodyText, title, pageData);

    // Check content length with more nuanced analysis
    const wordCount = contentAnalysis.wordCount;
    const characterCount = bodyText.length;
    const sentenceCount = contentAnalysis.sentenceCount;
    const paragraphCount = contentAnalysis.paragraphCount;

    if (wordCount < 200) {
      score -= 30;
      issues.push("Content is extremely short (less than 200 words)");
      suggestions.push("Add substantial, valuable content to improve SEO and user engagement");
    } else if (wordCount < 300) {
      score -= 25;
      issues.push("Content is too short (less than 300 words)");
      suggestions.push("Add more valuable content to improve SEO");
    } else if (wordCount < 500) {
      score -= 10;
      issues.push("Content could be more comprehensive");
      suggestions.push("Consider adding more detailed information");
    } else if (wordCount > 3000) {
      score -= 5;
      issues.push("Content is very long - ensure it's well-structured");
      suggestions.push("Break up long content with headings, bullet points, and visual elements");
    }

    // Check content readability
    const readabilityScore = contentAnalysis.readabilityScore;
    if (readabilityScore < 30) {
      score -= 15;
      issues.push("Content readability is poor - too complex for average readers");
      suggestions.push("Simplify sentence structure and use shorter, clearer sentences");
    } else if (readabilityScore < 50) {
      score -= 10;
      issues.push("Content readability could be improved");
      suggestions.push("Consider simplifying complex sentences and reducing jargon");
    }

    // Check keyword density and distribution
    const keywordAnalysis = contentAnalysis.keywordAnalysis;
    const topKeywords = keywordAnalysis.topKeywords;

    // Check for keyword stuffing
    const highDensityKeywords = topKeywords.filter((kw) => kw.density > 3);
    if (highDensityKeywords.length > 0) {
      score -= 15;
      issues.push(`Keyword stuffing detected: ${highDensityKeywords.map((kw) => kw.keyword).join(", ")}`);
      suggestions.push("Reduce keyword density to avoid penalties - aim for 1-2% density");
    }

    // Check for keyword distribution
    const titleKeywordMatch = keywordAnalysis.titleKeywordMatch;
    if (!titleKeywordMatch && topKeywords.length > 0) {
      score -= 10;
      issues.push("Important keywords not found in title");
      suggestions.push("Include main keywords naturally in your title");
    }

    // Check heading structure
    const headingAnalysis = contentAnalysis.headingAnalysis;
    if (headingAnalysis.h1Count === 0) {
      score -= 20;
      issues.push("No H1 heading found");
      suggestions.push("Add a single, descriptive H1 heading");
    } else if (headingAnalysis.h1Count > 1) {
      score -= 15;
      issues.push("Multiple H1 headings found");
      suggestions.push("Use only one H1 heading per page");
    }

    if (headingAnalysis.h2Count === 0 && wordCount > 500) {
      score -= 10;
      issues.push("No H2 headings found in long content");
      suggestions.push("Use H2 headings to structure your content");
    }

    // Check content uniqueness and quality indicators
    const qualityIndicators = contentAnalysis.qualityIndicators;

    if (qualityIndicators.hasLists === false && wordCount > 300) {
      score -= 5;
      issues.push("Content lacks visual structure");
      suggestions.push("Add bullet points, numbered lists, or other visual elements");
    }

    if (qualityIndicators.hasQuestions === false && wordCount > 500) {
      score -= 5;
      issues.push("Content could be more engaging");
      suggestions.push("Include questions or calls-to-action to improve engagement");
    }

    // Check content freshness
    const freshnessAnalysis = contentAnalysis.freshnessAnalysis;
    if (!freshnessAnalysis.isRecent && wordCount > 1000) {
      score -= 5;
      issues.push("Content may be outdated");
      suggestions.push("Update content with recent information and current data");
    }

    // Check for duplicate content indicators
    if (qualityIndicators.repetitivePhrases > 5) {
      score -= 10;
      issues.push("Content contains repetitive phrases");
      suggestions.push("Vary your language and avoid repetitive sentence structures");
    }

    // DEBUG: Verify the returned data structure
    console.log("checkContent topKeywords type:", typeof topKeywords);
    console.log("checkContent topKeywords is array:", Array.isArray(topKeywords));
    console.log("checkContent topKeywords length:", topKeywords?.length);

    const result = {
      score: Math.max(0, score),
      issues,
      suggestions,
      topKeywords,
      wordCount,
      characterCount,
      sentenceCount,
      paragraphCount,
      readabilityScore,
      keywordAnalysis,
      headingAnalysis,
      qualityIndicators,
      freshnessAnalysis,
    };

    // Verify again after creating the result object
    console.log("checkContent result.topKeywords type:", typeof result.topKeywords);
    console.log("checkContent result.topKeywords is array:", Array.isArray(result.topKeywords));
    console.log("checkContent result.topKeywords length:", result.topKeywords?.length);

    return result;
  }

  analyzeContentQuality(bodyText, title, pageData) {
    // Enhanced word count and text analysis
    const words = bodyText.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;
    const characterCount = bodyText.length;

    // Sentence count (simple approximation)
    const sentences = bodyText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = sentences.length;

    // Paragraph count
    const paragraphs = bodyText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const paragraphCount = paragraphs.length;

    // Readability analysis (simplified Flesch Reading Ease)
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const avgSyllablesPerWord = this.calculateAverageSyllables(words);
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord));

    // Enhanced keyword analysis
    const keywordAnalysis = this.performKeywordAnalysis(bodyText, title);

    // Heading analysis
    const headingAnalysis = {
      h1Count: (pageData.h1Text || []).length,
      h2Count: (pageData.h2Text || []).length,
      h3Count: (pageData.h3Text || []).length,
      h4Count: (pageData.h4Text || []).length,
      h5Count: (pageData.h5Text || []).length,
      h6Count: (pageData.h6Text || []).length,
    };

    // Quality indicators
    const qualityIndicators = {
      hasLists: /[•\-\*]\s|\d+\.\s/.test(bodyText),
      hasQuestions: /\?/.test(bodyText),
      hasNumbers: /\d+/.test(bodyText),
      hasLinks: /<a\s+href/i.test(bodyText) || /\[.*?\]\(.*?\)/.test(bodyText),
      repetitivePhrases: this.countRepetitivePhrases(bodyText),
    };

    // Freshness analysis
    const currentYear = new Date().getFullYear();
    const freshnessAnalysis = {
      isRecent: bodyText.includes(currentYear.toString()) || bodyText.includes((currentYear - 1).toString()),
      hasDates: /\b(20\d{2}|19\d{2})\b/.test(bodyText),
      hasTimeReferences: /\b(updated|recent|latest|new|current)\b/i.test(bodyText),
    };

    return {
      wordCount,
      characterCount,
      sentenceCount,
      paragraphCount,
      readabilityScore,
      keywordAnalysis,
      headingAnalysis,
      qualityIndicators,
      freshnessAnalysis,
    };
  }

  calculateAverageSyllables(words) {
    if (words.length === 0) return 0;

    const syllableCount = words.reduce((total, word) => {
      return total + this.countSyllables(word.toLowerCase());
    }, 0);

    return syllableCount / words.length;
  }

  countSyllables(word) {
    // Simple syllable counting algorithm
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");

    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  performKeywordAnalysis(bodyText, title) {
    const stopwords = new Set([
      "the",
      "and",
      "a",
      "an",
      "of",
      "to",
      "in",
      "for",
      "on",
      "with",
      "at",
      "by",
      "is",
      "it",
      "this",
      "that",
      "from",
      "as",
      "are",
      "be",
      "or",
      "was",
      "were",
      "but",
      "if",
      "your",
      "you",
      "we",
      "our",
      "they",
      "their",
      "i",
      "he",
      "she",
      "them",
      "his",
      "her",
      "its",
      "not",
      "can",
      "will",
      "just",
      "about",
      "into",
      "over",
      "than",
      "out",
      "up",
      "so",
      "what",
      "when",
      "how",
      "which",
      "who",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "shall",
      "get",
      "got",
      "make",
      "made",
      "take",
      "took",
      "come",
      "came",
      "go",
      "went",
      "see",
      "saw",
      "know",
      "knew",
      "think",
      "thought",
      "say",
      "said",
      "tell",
      "told",
      "give",
      "gave",
      "find",
      "found",
      "work",
      "worked",
      "call",
      "called",
      "try",
      "tried",
      "ask",
      "asked",
      "need",
      "needed",
      "feel",
      "felt",
      "become",
      "became",
      "leave",
      "left",
      "put",
      "mean",
      "meant",
      "keep",
      "kept",
      "let",
      "begin",
      "began",
      "seem",
      "seemed",
      "help",
      "helped",
      "talk",
      "talked",
      "turn",
      "turned",
      "start",
      "started",
      "show",
      "showed",
      "hear",
      "heard",
      "play",
      "played",
      "run",
      "ran",
      "move",
      "moved",
      "live",
      "lived",
      "believe",
      "believed",
      "hold",
      "held",
      "bring",
      "brought",
      "happen",
      "happened",
      "write",
      "wrote",
      "provide",
      "provided",
      "sit",
      "sat",
      "stand",
      "stood",
      "lose",
      "lost",
      "pay",
      "paid",
      "meet",
      "met",
      "include",
      "included",
      "continue",
      "continued",
      "set",
      "set",
      "learn",
      "learned",
      "change",
      "changed",
      "lead",
      "led",
      "understand",
      "understood",
      "watch",
      "watched",
      "follow",
      "followed",
      "stop",
      "stopped",
      "create",
      "created",
      "speak",
      "spoke",
      "read",
      "read",
      "allow",
      "allowed",
      "add",
      "added",
      "spend",
      "spent",
      "grow",
      "grew",
      "open",
      "opened",
      "walk",
      "walked",
      "win",
      "won",
      "offer",
      "offered",
      "remember",
      "remembered",
      "love",
      "loved",
      "consider",
      "considered",
      "appear",
      "appeared",
      "buy",
      "bought",
      "wait",
      "waited",
      "serve",
      "served",
      "die",
      "died",
      "send",
      "sent",
      "expect",
      "expected",
      "build",
      "built",
      "stay",
      "stayed",
      "fall",
      "fell",
      "cut",
      "cut",
      "reach",
      "reached",
      "kill",
      "killed",
      "remain",
      "remained",
    ]);

    // Extract words and count frequencies
    const words = bodyText.toLowerCase().match(/[a-z0-9\-]+/g) || [];
    const counts = new Map();
    const bigrams = new Map();
    const trigrams = new Map();

    // Count individual words
    for (const word of words) {
      if (word.length >= 3 && !stopwords.has(word)) {
        counts.set(word, (counts.get(word) || 0) + 1);
      }
    }

    // Count bigrams (2-word phrases)
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (!stopwords.has(words[i]) && !stopwords.has(words[i + 1]) && words[i].length >= 3 && words[i + 1].length >= 3) {
        bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
      }
    }

    // Count trigrams (3-word phrases)
    for (let i = 0; i < words.length - 2; i++) {
      const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (
        !stopwords.has(words[i]) &&
        !stopwords.has(words[i + 1]) &&
        !stopwords.has(words[i + 2]) &&
        words[i].length >= 3 &&
        words[i + 1].length >= 3 &&
        words[i + 2].length >= 3
      ) {
        trigrams.set(trigram, (trigrams.get(trigram) || 0) + 1);
      }
    }

    const totalWords = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;

    // Combine single words, bigrams, and trigrams
    const allKeywords = [
      ...Array.from(counts.entries()).map(([keyword, count]) => ({
        keyword,
        count,
        density: +((count / totalWords) * 100).toFixed(2),
        type: "word",
      })),
      ...Array.from(bigrams.entries()).map(([keyword, count]) => ({
        keyword,
        count,
        density: +((count / totalWords) * 100).toFixed(2),
        type: "bigram",
      })),
      ...Array.from(trigrams.entries()).map(([keyword, count]) => ({
        keyword,
        count,
        density: +((count / totalWords) * 100).toFixed(2),
        type: "trigram",
      })),
    ];

    const topKeywords = allKeywords
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .filter((kw) => kw.count > 1); // Only include keywords that appear more than once

    // Check if keywords appear in title
    const titleWords = title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
    const titleKeywordMatch = topKeywords
      .slice(0, 5)
      .some((kw) => titleWords.some((tw) => tw.includes(kw.keyword.split(" ")[0]) || kw.keyword.split(" ")[0].includes(tw)));

    return {
      topKeywords,
      titleKeywordMatch,
      totalKeywords: allKeywords.length,
      keywordDiversity: counts.size,
    };
  }

  countRepetitivePhrases(text) {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const phraseCounts = new Map();

    sentences.forEach((sentence) => {
      const words = sentence.toLowerCase().match(/[a-z0-9]+/g) || [];
      for (let i = 0; i < words.length - 2; i++) {
        const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
      }
    });

    return Array.from(phraseCounts.values()).filter((count) => count > 2).length;
  }

  async checkMetaTags($, pageData) {
    const title = pageData.title || "";
    const description = pageData.metaDescription || "";
    const keywords = pageData.metaKeywords || "";

    return {
      title,
      description,
      keywords,
      hasTitle: !!title,
      hasDescription: !!description,
      hasKeywords: !!keywords,
      titleLength: title.length,
      descriptionLength: description.length,
    };
  }

  async checkImages($, pageData) {
    const images = pageData.images || [];
    const totalImages = images.length;

    // Enhanced image analysis
    const imageAnalysis = await this.analyzeImages(images, pageData);

    // Process each image and add comprehensive analysis
    const imageList = images.map((img) => {
      const hasAlt = Boolean(img.alt && img.alt.trim());
      const isOversized = img.width > 2000 || img.height > 2000;
      const isTooSmall = img.width < 50 || img.height < 50;
      const aspectRatio = img.width > 0 && img.height > 0 ? (img.width / img.height).toFixed(2) : 0;
      const estimatedSize = this.estimateImageSize(img.width, img.height, img.src);

      // Analyze alt text quality
      const altQuality = this.analyzeAltText(img.alt || "");

      return {
        src: img.src || "",
        alt: img.alt || "",
        title: img.title || "",
        width: img.width || 0,
        height: img.height || 0,
        hasAlt,
        isOversized,
        isTooSmall,
        aspectRatio: parseFloat(aspectRatio),
        estimatedSizeKB: estimatedSize,
        loading: img.loading || "auto",
        altQuality,
        format: this.detectImageFormat(img.src),
        isResponsive: this.isImageResponsive(img),
        hasLazyLoading: img.loading === "lazy",
        isDecorative: this.isDecorativeImage(img.alt || ""),
        needsOptimization: this.needsOptimization(img),
      };
    });

    const withoutAlt = imageList.filter((img) => !img.hasAlt).length;
    const oversized = imageList.filter((img) => img.isOversized).length;
    const tooSmall = imageList.filter((img) => img.isTooSmall).length;
    const lazyImages = imageList.filter((img) => img.hasLazyLoading).length;
    const responsiveImages = imageList.filter((img) => img.isResponsive).length;
    const optimizedImages = imageList.filter((img) => !img.needsOptimization).length;
    const decorativeImages = imageList.filter((img) => img.isDecorative).length;

    const issues = [];
    const suggestions = [];

    // Alt text analysis
    if (withoutAlt > 0) {
      issues.push(`${withoutAlt} images missing alt attributes`);
      suggestions.push("Add descriptive alt text to all images for accessibility and SEO");
    }

    const poorAltText = imageList.filter((img) => img.hasAlt && img.altQuality.score < 50).length;
    if (poorAltText > 0) {
      issues.push(`${poorAltText} images have poor quality alt text`);
      suggestions.push("Improve alt text to be more descriptive and meaningful");
    }

    // Size analysis
    if (oversized > 0) {
      issues.push(`${oversized} images are oversized (over 2000px)`);
      suggestions.push("Resize large images to appropriate dimensions for web display");
    }

    if (tooSmall > 0) {
      issues.push(`${tooSmall} images are too small (under 50px)`);
      suggestions.push("Consider if very small images are necessary or if they should be combined into sprites");
    }

    // Performance analysis
    const totalImageSizeKB = imageList.reduce((sum, img) => sum + img.estimatedSizeKB, 0);
    const avgImageSizeKB = totalImages > 0 ? totalImageSizeKB / totalImages : 0;

    if (totalImageSizeKB > 2000) {
      // 2MB total
      issues.push(`Total image size is very large (${(totalImageSizeKB / 1024).toFixed(1)}MB)`);
      suggestions.push("Compress images and consider using modern formats like WebP");
    } else if (totalImageSizeKB > 1000) {
      // 1MB total
      issues.push(`Total image size could be optimized (${(totalImageSizeKB / 1024).toFixed(1)}MB)`);
      suggestions.push("Consider compressing images for better performance");
    }

    if (avgImageSizeKB > 500) {
      issues.push(`Average image size is large (${avgImageSizeKB.toFixed(0)}KB per image)`);
      suggestions.push("Optimize individual images for web delivery");
    }

    // Lazy loading analysis
    if (lazyImages === 0 && totalImages > 3) {
      issues.push("No lazy loading implemented");
      suggestions.push("Implement lazy loading for images below the fold to improve page load speed");
    } else if (lazyImages < totalImages * 0.7 && totalImages > 5) {
      issues.push("Incomplete lazy loading implementation");
      suggestions.push("Apply lazy loading to more images for better performance");
    }

    // Responsive images analysis
    if (responsiveImages < totalImages * 0.5 && totalImages > 2) {
      issues.push("Limited responsive image implementation");
      suggestions.push("Use responsive images with srcset for different screen sizes");
    }

    // Format analysis
    const modernFormats = imageList.filter((img) => ["webp", "avif"].includes(img.format)).length;
    if (modernFormats === 0 && totalImages > 0) {
      issues.push("No modern image formats detected");
      suggestions.push("Consider using WebP or AVIF formats for better compression");
    }

    // Content analysis
    if (totalImages === 0 && pageData.bodyText && pageData.bodyText.length > 1000) {
      issues.push("No images found in content-rich page");
      suggestions.push("Add relevant images to improve user engagement and SEO");
    }

    // Decorative images analysis
    if (decorativeImages > totalImages * 0.8 && totalImages > 3) {
      issues.push("High percentage of decorative images");
      suggestions.push("Ensure decorative images have empty alt attributes (alt='')");
    }

    const result = {
      total: totalImages,
      withoutAlt,
      oversized,
      tooSmall,
      lazyImages,
      responsiveImages,
      optimizedImages,
      decorativeImages,
      totalSizeKB: totalImageSizeKB,
      avgSizeKB: avgImageSizeKB,
      modernFormats,
      issues,
      suggestions,
      list: imageList,
    };

    // DEBUG: Verify the returned data structure
    console.log("checkImages result type:", typeof result.list);
    console.log("checkImages result is array:", Array.isArray(result.list));
    console.log("checkImages result length:", result.list?.length);

    return result;
  }

  async analyzeImages(images, pageData) {
    // Analyze image patterns and provide insights
    const analysis = {
      totalImages: images.length,
      hasImages: images.length > 0,
      imageDensity: (images.length / Math.max(pageData.bodyText?.length || 1, 1)) * 1000, // images per 1000 characters
      commonFormats: this.getCommonImageFormats(images),
      sizeDistribution: this.getImageSizeDistribution(images),
    };

    return analysis;
  }

  estimateImageSize(width, height, src) {
    // Rough estimation based on dimensions and format
    if (!width || !height) return 0;

    const format = this.detectImageFormat(src);
    const pixels = width * height;

    // Rough estimates based on format and compression
    const estimates = {
      jpg: pixels * 0.0003, // ~0.3 bytes per pixel
      jpeg: pixels * 0.0003,
      png: pixels * 0.0008, // ~0.8 bytes per pixel (less compression)
      gif: pixels * 0.0005,
      webp: pixels * 0.0002, // ~0.2 bytes per pixel (better compression)
      avif: pixels * 0.00015, // ~0.15 bytes per pixel (best compression)
      svg: Math.max(width + height, 1000), // SVG size estimation
    };

    return Math.round(estimates[format] || pixels * 0.0004);
  }

  detectImageFormat(src) {
    if (!src) return "unknown";

    const match = src.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    if (match) {
      return match[1].toLowerCase();
    }

    return "unknown";
  }

  analyzeAltText(altText) {
    if (!altText || altText.trim() === "") {
      return { score: 0, issues: ["Missing alt text"], suggestions: ["Add descriptive alt text"] };
    }

    const issues = [];
    const suggestions = [];
    let score = 100;

    // Length analysis
    if (altText.length < 5) {
      score -= 30;
      issues.push("Alt text too short");
      suggestions.push("Make alt text more descriptive");
    } else if (altText.length > 125) {
      score -= 20;
      issues.push("Alt text too long");
      suggestions.push("Keep alt text concise but descriptive");
    }

    // Quality indicators
    if (altText.toLowerCase().includes("image") || altText.toLowerCase().includes("picture")) {
      score -= 15;
      issues.push("Alt text contains redundant words");
      suggestions.push('Avoid words like "image" or "picture" in alt text');
    }

    if (altText.toLowerCase().includes("click here") || altText.toLowerCase().includes("read more")) {
      score -= 25;
      issues.push("Alt text is not descriptive");
      suggestions.push("Describe the image content, not the action");
    }

    // Check for meaningful content
    const meaningfulWords = altText
      .split(/\s+/)
      .filter((word) => word.length > 2 && !["the", "and", "or", "but", "for", "with"].includes(word.toLowerCase()));

    if (meaningfulWords.length < 2) {
      score -= 20;
      issues.push("Alt text lacks meaningful content");
      suggestions.push("Include more descriptive words in alt text");
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      length: altText.length,
      wordCount: altText.split(/\s+/).length,
    };
  }

  isImageResponsive(img) {
    // Check if image appears to be responsive
    return (
      img.src.includes("srcset") ||
      img.src.includes("sizes") ||
      img.className?.includes("responsive") ||
      img.className?.includes("img-fluid")
    );
  }

  isDecorativeImage(altText) {
    // Check if image is decorative (should have empty alt)
    const decorativeKeywords = ["decorative", "ornament", "decoration", "spacer", "divider"];
    return decorativeKeywords.some((keyword) => altText.toLowerCase().includes(keyword));
  }

  needsOptimization(img) {
    // Determine if image needs optimization
    const format = this.detectImageFormat(img.src);
    const estimatedSize = this.estimateImageSize(img.width, img.height, img.src);

    return (
      img.isOversized ||
      estimatedSize > 500 || // > 500KB
      !["webp", "avif"].includes(format) ||
      !img.hasLazyLoading
    );
  }

  getCommonImageFormats(images) {
    const formats = {};
    images.forEach((img) => {
      const format = this.detectImageFormat(img.src);
      formats[format] = (formats[format] || 0) + 1;
    });
    return formats;
  }

  getImageSizeDistribution(images) {
    const distribution = {
      small: 0, // < 100px
      medium: 0, // 100-500px
      large: 0, // 500-2000px
      xlarge: 0, // > 2000px
    };

    images.forEach((img) => {
      const maxDimension = Math.max(img.width || 0, img.height || 0);
      if (maxDimension < 100) distribution.small++;
      else if (maxDimension < 500) distribution.medium++;
      else if (maxDimension < 2000) distribution.large++;
      else distribution.xlarge++;
    });

    return distribution;
  }

  async checkLinks($, pageData, baseUrl) {
    const links = pageData.links || [];
    const totalLinks = links.length;
    let external = 0;
    let internal = 0;
    let broken = 0;
    const issues = [];
    const suggestions = [];

    // Enhanced link analysis
    const linkAnalysis = await this.analyzeLinks(links, baseUrl, pageData);

    // Process each link and add comprehensive analysis
    const linkList = links.map((link) => {
      let linkType = "unknown";
      let isWorking = true;
      let statusCode = 200;
      let redirectCount = 0;
      let responseTime = 0;

      try {
        const href = link.href || "";

        if (href.startsWith("mailto:")) {
          linkType = "mailto";
        } else if (href.startsWith("tel:")) {
          linkType = "tel";
        } else if (href.startsWith("#")) {
          linkType = "anchor";
        } else if (href.startsWith("javascript:")) {
          linkType = "javascript";
        } else if (href.startsWith("http")) {
          const linkUrl = new URL(href);
          const baseHostname = new URL(baseUrl).hostname;
          linkType = linkUrl.hostname === baseHostname ? "internal" : "external";
        } else if (href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) {
          linkType = "internal";
        } else if (href.startsWith("data:")) {
          linkType = "data";
        } else if (href.startsWith("blob:")) {
          linkType = "blob";
        }

        if (linkType === "external") external++;
        if (linkType === "internal") internal++;
      } catch (e) {
        linkType = "invalid";
        isWorking = false;
        statusCode = 0;
      }

      // Analyze link quality
      const linkQuality = this.analyzeLinkQuality(link, linkType);

      return {
        href: link.href || "",
        text: link.text || "",
        title: link.title || "",
        rel: link.rel || "",
        target: link.target || "",
        type: linkType,
        isWorking,
        statusCode,
        redirectCount,
        responseTime,
        quality: linkQuality,
        isAccessible: linkQuality.isAccessible,
        hasDescriptiveText: linkQuality.hasDescriptiveText,
        isExternal: linkType === "external",
        isInternal: linkType === "internal",
        isAnchor: linkType === "anchor",
        isMailto: linkType === "mailto",
        isTel: linkType === "tel",
        isJavaScript: linkType === "javascript",
        opensInNewTab: link.target === "_blank",
        hasNoFollow: link.rel && link.rel.includes("nofollow"),
        hasNoOpener: link.rel && link.rel.includes("noopener"),
        hasNoReferrer: link.rel && link.rel.includes("noreferrer"),
      };
    });

    // Enhanced link status checking with more detailed analysis
    const linkStatusResults = await this.checkLinkStatuses(linkList, baseUrl);

    // Update link list with status results
    linkList.forEach((link, index) => {
      const statusResult = linkStatusResults.find((result) => result.href === link.href);
      if (statusResult) {
        link.isWorking = statusResult.isWorking;
        link.statusCode = statusResult.statusCode;
        link.redirectCount = statusResult.redirectCount;
        link.responseTime = statusResult.responseTime;
        link.finalUrl = statusResult.finalUrl;
        link.errorMessage = statusResult.errorMessage;
      }
    });

    // Count different types of links
    external = linkList.filter((l) => l.type === "external").length;
    internal = linkList.filter((l) => l.type === "internal").length;
    const anchorLinks = linkList.filter((l) => l.type === "anchor").length;
    const mailtoLinks = linkList.filter((l) => l.type === "mailto").length;
    const telLinks = linkList.filter((l) => l.type === "tel").length;
    const javascriptLinks = linkList.filter((l) => l.type === "javascript").length;

    const invalidLinks = linkList.filter((l) => l.isWorking === false).length;
    broken = invalidLinks;

    // Enhanced issue detection
    if (totalLinks === 0) {
      issues.push("No links found");
      suggestions.push("Add relevant internal and external links to improve user experience and SEO");
    } else if (totalLinks < 5) {
      issues.push("Very few links found - consider adding more relevant links");
      suggestions.push("Add more internal links for better site structure and external links for credibility");
    }

    // External link analysis
    const noFollowLinks = linkList.filter((link) => link.hasNoFollow).length;
    const externalNoFollowRatio = external > 0 ? noFollowLinks / external : 0;

    if (external > totalLinks * 0.8) {
      issues.push("High percentage of external links");
      suggestions.push("Balance external links with internal links for better SEO");
    }

    if (externalNoFollowRatio > 0.8) {
      issues.push("Most external links have nofollow attribute");
      suggestions.push("Consider removing nofollow from high-quality external links to pass link equity");
    }

    // Broken link analysis
    if (invalidLinks > 0) {
      issues.push(`${invalidLinks} links may be invalid or broken`);
      suggestions.push("Fix broken links to improve user experience and SEO");
    }

    // Accessibility analysis
    const linksWithoutText = linkList.filter((link) => !link.hasDescriptiveText).length;
    if (linksWithoutText > 0) {
      issues.push(`${linksWithoutText} links without descriptive text`);
      suggestions.push("Add descriptive anchor text to all links for better accessibility");
    }

    const linksOpeningInNewTab = linkList.filter((link) => link.opensInNewTab).length;
    if (linksOpeningInNewTab > totalLinks * 0.5) {
      issues.push("Many links open in new tabs");
      suggestions.push("Consider user experience - opening too many links in new tabs can be disruptive");
    }

    // Security analysis
    const insecureLinks = linkList.filter((link) => link.href.startsWith("http://") && link.type === "external").length;
    if (insecureLinks > 0) {
      issues.push(`${insecureLinks} external links use insecure HTTP protocol`);
      suggestions.push("Use HTTPS links for better security and SEO");
    }

    // Internal linking analysis
    if (internal < 3 && totalLinks > 10) {
      issues.push("Limited internal linking");
      suggestions.push("Add more internal links to improve site structure and page authority distribution");
    }

    // Anchor link analysis
    if (anchorLinks > totalLinks * 0.3) {
      issues.push("High percentage of anchor links");
      suggestions.push("Ensure anchor links have corresponding content sections");
    }

    const result = {
      total: totalLinks,
      broken,
      external,
      internal,
      anchor: anchorLinks,
      mailto: mailtoLinks,
      tel: telLinks,
      javascript: javascriptLinks,
      noFollow: noFollowLinks,
      opensInNewTab: linksOpeningInNewTab,
      insecure: insecureLinks,
      issues,
      suggestions,
      withoutTextCount: linksWithoutText,
      withoutText: linkList
        .filter((link) => !link.hasDescriptiveText)
        .slice(0, 20)
        .map((l) => ({
          href: l.href,
          type: l.type,
          target: l.target,
          rel: l.rel,
          statusCode: l.statusCode,
          isWorking: l.isWorking,
          text: l.text,
        })),
      list: linkList,
      analysis: linkAnalysis,
    };

    // DEBUG: Verify the returned data structure
    console.log("checkLinks result type:", typeof result.list);
    console.log("checkLinks result is array:", Array.isArray(result.list));
    console.log("checkLinks result length:", result.list?.length);
    console.log("withoutText type:", typeof result.withoutText);
    console.log("withoutText is array:", Array.isArray(result.withoutText));
    console.log("withoutText length:", result.withoutText?.length);

    return result;
  }

  async analyzeLinks(links, baseUrl, pageData) {
    const analysis = {
      totalLinks: links.length,
      linkDensity: (links.length / Math.max(pageData.bodyText?.length || 1, 1)) * 1000, // links per 1000 characters
      averageLinkLength: 0,
      commonDomains: {},
      linkDistribution: {
        internal: 0,
        external: 0,
        anchor: 0,
        mailto: 0,
        tel: 0,
        javascript: 0,
      },
    };

    // Calculate average link text length
    const linkTexts = links.map((link) => link.text || "").filter((text) => text.length > 0);
    analysis.averageLinkLength = linkTexts.length > 0 ? linkTexts.reduce((sum, text) => sum + text.length, 0) / linkTexts.length : 0;

    // Analyze external domains
    links.forEach((link) => {
      try {
        if (link.href.startsWith("http")) {
          const url = new URL(link.href);
          const domain = url.hostname;
          analysis.commonDomains[domain] = (analysis.commonDomains[domain] || 0) + 1;
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    });

    return analysis;
  }

  analyzeLinkQuality(link, linkType) {
    const text = link.text || "";
    const title = link.title || "";
    const href = link.href || "";

    const issues = [];
    const suggestions = [];
    let score = 100;

    // Check for descriptive text
    const hasDescriptiveText = text.trim().length > 0;
    if (!hasDescriptiveText) {
      score -= 40;
      issues.push("Missing anchor text");
      suggestions.push("Add descriptive anchor text");
    } else if (text.trim().length < 3) {
      score -= 20;
      issues.push("Anchor text too short");
      suggestions.push("Use more descriptive anchor text");
    } else if (text.toLowerCase().includes("click here") || text.toLowerCase().includes("read more")) {
      score -= 25;
      issues.push("Non-descriptive anchor text");
      suggestions.push("Use descriptive anchor text instead of generic phrases");
    }

    // Check for title attribute
    if (!title && linkType === "external") {
      score -= 10;
      issues.push("External link missing title attribute");
      suggestions.push("Add title attribute to external links for better UX");
    }

    // Check for security attributes on external links
    if (linkType === "external" && link.target === "_blank") {
      if (!link.rel || !link.rel.includes("noopener")) {
        score -= 15;
        issues.push("External link opens in new tab without noopener");
        suggestions.push("Add rel='noopener' to external links that open in new tabs");
      }
    }

    // Check for accessibility
    const isAccessible = hasDescriptiveText && text.trim().length >= 3;
    if (!isAccessible) {
      score -= 30;
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      hasDescriptiveText,
      isAccessible,
      textLength: text.length,
      hasTitle: !!title,
      isSecure: linkType !== "external" || (link.rel && link.rel.includes("noopener")),
    };
  }

  async checkLinkStatuses(linkList, baseUrl) {
    const results = [];
    const uniqueHrefs = [...new Set(linkList.map((link) => link.href).filter((href) => href))];
    const MAX_CHECKS = 50; // Increased limit for more comprehensive checking
    const toCheck = uniqueHrefs.slice(0, MAX_CHECKS);

    const checkUrlStatus = async (url) => {
      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // Increased timeout

        try {
          const response = await axios.head(url, {
            maxRedirects: 10,
            signal: controller.signal,
            validateStatus: () => true,
            timeout: 8000,
          });
          clearTimeout(timeout);

          return {
            statusCode: response.status,
            isWorking: response.status >= 200 && response.status < 400,
            redirectCount: response.request._redirectCount || 0,
            responseTime: Date.now() - startTime,
            finalUrl: response.request.res.responseUrl || url,
            errorMessage: null,
          };
        } catch (e) {
          clearTimeout(timeout);
          // Fallback to GET request
          const controller2 = new AbortController();
          const timeout2 = setTimeout(() => controller2.abort(), 10000);

          try {
            const getResponse = await axios.get(url, {
              maxRedirects: 10,
              signal: controller2.signal,
              validateStatus: () => true,
              timeout: 10000,
              responseType: "text",
              maxContentLength: 1024, // Limit content size for GET requests
            });
            clearTimeout(timeout2);

            return {
              statusCode: getResponse.status,
              isWorking: getResponse.status >= 200 && getResponse.status < 400,
              redirectCount: getResponse.request._redirectCount || 0,
              responseTime: Date.now() - startTime,
              finalUrl: getResponse.request.res.responseUrl || url,
              errorMessage: null,
            };
          } catch (getError) {
            clearTimeout(timeout2);
            return {
              statusCode: 0,
              isWorking: false,
              redirectCount: 0,
              responseTime: Date.now() - startTime,
              finalUrl: url,
              errorMessage: getError.message,
            };
          }
        }
      } catch (err) {
        return {
          statusCode: 0,
          isWorking: false,
          redirectCount: 0,
          responseTime: Date.now() - startTime,
          finalUrl: url,
          errorMessage: err.message,
        };
      }
    };

    // Process links with controlled concurrency
    const CONCURRENCY = 8; // Increased concurrency
    let cursor = 0;
    const workers = Array.from({ length: CONCURRENCY }, async () => {
      while (cursor < toCheck.length) {
        const myIdx = cursor++;
        const href = toCheck[myIdx];
        if (!href) continue;

        const result = await checkUrlStatus(href);
        results.push({
          href,
          ...result,
        });
      }
    });

    await Promise.all(workers);

    return results;
  }
}

module.exports = new SEOAuditService();
