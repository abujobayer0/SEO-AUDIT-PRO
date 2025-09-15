const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

class PDFReportService {
  generateReport(auditData, userData, logoBuffer, competitors = []) {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      info: {
        Title: `SEO Audit Report - ${auditData.websiteUrl}`,
        Author: userData.companyName || "SEO Audit Pro",
        Subject: "SEO Audit Report",
        Keywords: "SEO, Audit, Report, Website Analysis",
      },
    });

    // Page dimensions
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 40;
    const contentWidth = pageWidth - 2 * margin;

    // Color scheme
    const colors = {
      primary: userData.brandColor || "#2563eb",
      secondary: "#64748b",
      success: "#10b981",
      warning: "#f59e0b",
      danger: "#ef4444",
      light: "#f8fafc",
      dark: "#1e293b",
      white: "#ffffff",
      gray100: "#f1f5f9",
      gray200: "#e2e8f0",
      gray300: "#cbd5e1",
      gray400: "#94a3b8",
      gray500: "#64748b",
      gray600: "#475569",
      gray700: "#334155",
      gray800: "#1e293b",
      gray900: "#0f172a",
    };

    let currentY = margin;

    // Helper functions
    const addPage = () => {
      doc.addPage();
      currentY = margin;
    };

    const checkPageBreak = (requiredHeight) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        addPage();
      }
    };

    const getScoreColor = (score) => {
      if (score >= 80) return colors.success;
      if (score >= 60) return colors.warning;
      return colors.danger;
    };

    const safeText = (text, x, y, options = {}) => {
      try {
        const safeContent = String(text || "")
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
          .replace(/[^\x20-\x7E\xA0-\xFF]/g, ""); // Remove non-printable characters including emojis
        doc.text(safeContent, x, y, options);
      } catch (error) {
        console.error("Error adding text to PDF:", error);
        doc.text("Content unavailable", x, y, options);
      }
    };

    const drawRoundedRect = (x, y, width, height, radius, fillColor, strokeColor = null) => {
      doc.roundedRect(x, y, width, height, radius);
      if (fillColor) {
        doc.fillColor(fillColor).fill();
      }
      if (strokeColor) {
        doc.strokeColor(strokeColor).stroke();
      }
    };

    const addSectionHeader = (title, iconText = null) => {
      checkPageBreak(60);

      // Section background
      drawRoundedRect(margin, currentY, contentWidth, 50, 8, colors.gray100);

      // Section line
      doc.rect(margin, currentY, 6, 50).fillColor(colors.primary).fill();

      // Icon if provided
      let textX = margin + 20;
      if (iconText) {
        // Add simple geometric icon
        drawRoundedRect(margin + 20, currentY + 15, 20, 20, 4, colors.primary);
        doc.fontSize(10).fillColor(colors.white);
        safeText(iconText, margin + 25, currentY + 22, { width: 10, align: "center" });
        textX = margin + 55;
      }

      // Section title
      doc.fontSize(18).fillColor(colors.primary);
      safeText(title, textX, currentY + 18);

      currentY += 70;
      return currentY;
    };

    const addScoreBox = (label, score, x, y, width = 120, height = 80) => {
      const scoreColor = getScoreColor(score);

      // Main box with shadow effect
      drawRoundedRect(x + 2, y + 2, width, height, 12, colors.gray300); // Shadow
      drawRoundedRect(x, y, width, height, 12, colors.white, colors.gray200); // Main box

      // Score circle
      const centerX = x + width / 2;
      const centerY = y + 30;
      const radius = 22;

      doc.circle(centerX, centerY, radius).fillColor(scoreColor).fill();
      doc
        .circle(centerX, centerY, radius - 2)
        .strokeColor(colors.white)
        .lineWidth(2)
        .stroke();

      // Score text
      doc.fontSize(18).fillColor(colors.white);
      safeText(score.toString(), centerX - 10, centerY - 6);

      // Label
      doc.fontSize(11).fillColor(colors.gray600);
      safeText(label, x + 5, y + height - 20, { width: width - 10, align: "center" });

      return y + height + 20;
    };

    const addProgressBar = (label, percentage, x, y, width = 200) => {
      const barHeight = 8;
      const color = getScoreColor(percentage);

      // Label
      doc.fontSize(10).fillColor(colors.gray700);
      safeText(label, x, y);

      // Background bar
      drawRoundedRect(x, y + 15, width, barHeight, 4, colors.gray200);

      // Progress bar
      const progressWidth = (width * percentage) / 100;
      drawRoundedRect(x, y + 15, progressWidth, barHeight, 4, color);

      // Percentage text
      doc.fontSize(9).fillColor(colors.gray600);
      safeText(`${percentage}%`, x + width + 10, y + 12);

      return y + 35;
    };

    const addMetricCard = (title, value, unit, x, y, width = 140, height = 60) => {
      drawRoundedRect(x, y, width, height, 8, colors.white, colors.gray200);

      doc.fontSize(10).fillColor(colors.gray600);
      safeText(title, x + 10, y + 10);

      doc.fontSize(16).fillColor(colors.dark);
      safeText(value, x + 10, y + 25);

      doc.fontSize(8).fillColor(colors.gray500);
      safeText(unit, x + 10, y + 45);

      return y + height + 10;
    };

    // === HEADER SECTION ===
    // Header background
    drawRoundedRect(margin, currentY, contentWidth, 100, 12, colors.primary);

    // Logo section
    console.log("=== LOGO RENDERING DEBUG ===");
    console.log("logoBuffer exists:", !!logoBuffer);
    console.log("logoBuffer length:", logoBuffer ? logoBuffer.length : "N/A");

    if (logoBuffer) {
      try {
        console.log("Attempting to render logo image...");
        doc.image(logoBuffer, margin + 20, currentY + 20, {
          width: 60,
          height: 60,
          fit: [60, 60],
        });
        console.log("Logo image rendered successfully!");
      } catch (error) {
        console.error("Logo image rendering failed:", error.message);
        console.error("Logo error stack:", error.stack);
        // Enhanced logo placeholder with geometric design
        drawRoundedRect(margin + 20, currentY + 20, 60, 60, 8, colors.white, colors.gray300);

        // Add geometric design inside
        doc
          .rect(margin + 30, currentY + 30, 40, 40)
          .fillColor(colors.primary)
          .fill();
        doc
          .rect(margin + 35, currentY + 35, 30, 30)
          .fillColor(colors.white)
          .fill();

        doc.fontSize(8).fillColor(colors.primary);
        safeText("SEO", margin + 45, currentY + 45);
        doc.fontSize(6).fillColor(colors.primary);
        safeText("AUDIT", margin + 43, currentY + 55);
      }
    } else {
      // Enhanced logo placeholder with geometric design
      drawRoundedRect(margin + 20, currentY + 20, 60, 60, 8, colors.white, colors.gray300);

      // Add geometric design inside
      doc
        .rect(margin + 30, currentY + 30, 40, 40)
        .fillColor(colors.primary)
        .fill();
      doc
        .rect(margin + 35, currentY + 35, 30, 30)
        .fillColor(colors.white)
        .fill();

      doc.fontSize(8).fillColor(colors.primary);
      safeText("SEO", margin + 45, currentY + 45);
      doc.fontSize(6).fillColor(colors.primary);
      safeText("AUDIT", margin + 43, currentY + 55);
    }

    // Company name and title
    doc.fontSize(24).fillColor(colors.white);
    safeText(userData.companyName || "SEO Audit Pro", margin + 100, currentY + 25);

    doc.fontSize(14).fillColor(colors.gray100);
    safeText("SEO Audit Report", margin + 100, currentY + 50);

    doc.fontSize(10).fillColor(colors.gray200);
    safeText(`Generated on ${new Date().toLocaleDateString()}`, margin + 100, currentY + 70);

    currentY += 120;

    // === EXECUTIVE SUMMARY ===
    addSectionHeader("Executive Summary", "ES");

    // Website info card
    drawRoundedRect(margin, currentY, contentWidth, 60, 12, colors.white, colors.gray200);
    doc.fontSize(12).fillColor(colors.gray700);
    safeText("Website Analyzed:", margin + 20, currentY + 15);
    doc.fontSize(16).fillColor(colors.primary);
    safeText(auditData.websiteUrl, margin + 20, currentY + 35);
    currentY += 80;

    // Overall score with large display
    drawRoundedRect(margin, currentY, contentWidth, 80, 12, colors.white, colors.gray200);

    // Large score circle
    const scoreX = margin + 60;
    const scoreY = currentY + 40;
    doc.circle(scoreX, scoreY, 30).fillColor(getScoreColor(auditData.overallScore)).fill();
    doc.circle(scoreX, scoreY, 25).strokeColor(colors.white).lineWidth(3).stroke();
    doc.fontSize(20).fillColor(colors.white);
    safeText(auditData.overallScore.toString(), scoreX - 12, scoreY - 8);

    // Score interpretation
    doc.fontSize(16).fillColor(colors.dark);
    safeText("Overall SEO Score", margin + 120, currentY + 20);

    let interpretation = "";
    if (auditData.overallScore >= 80) {
      interpretation = "Excellent! Your website is performing very well.";
    } else if (auditData.overallScore >= 60) {
      interpretation = "Good foundation with room for improvement.";
    } else {
      interpretation = "Needs improvement. Focus on key issues.";
    }

    doc.fontSize(12).fillColor(colors.gray600);
    safeText(interpretation, margin + 120, currentY + 45, { width: 300 });

    currentY += 100;

    // === PERFORMANCE SCORES ===
    addSectionHeader("Performance Overview", "PO");

    // Score boxes in a row
    const boxY = currentY;
    const boxSpacing = (contentWidth - 4 * 120) / 3;

    addScoreBox("Overall", auditData.overallScore, margin, boxY);
    addScoreBox("Performance", auditData.performance?.score || 0, margin + 120 + boxSpacing, boxY);
    addScoreBox("SEO", auditData.seo?.score || 0, margin + 2 * (120 + boxSpacing), boxY);
    addScoreBox("Mobile", auditData.mobileFriendly?.score || 0, margin + 3 * (120 + boxSpacing), boxY);

    currentY += 120;

    // === CORE WEB VITALS ===
    if (auditData.performance?.coreWebVitals) {
      addSectionHeader("Core Web Vitals", "WV");

      const vitals = auditData.performance.coreWebVitals;
      const cardWidth = (contentWidth - 20) / 3;

      if (vitals.firstContentfulPaint) {
        addMetricCard(
          "First Contentful Paint",
          Math.round((vitals.firstContentfulPaint / 1000) * 10) / 10,
          "seconds",
          margin,
          currentY,
          cardWidth
        );
      }

      if (vitals.largestContentfulPaint) {
        addMetricCard(
          "Largest Contentful Paint",
          Math.round((vitals.largestContentfulPaint / 1000) * 10) / 10,
          "seconds",
          margin + cardWidth + 10,
          currentY,
          cardWidth
        );
      }

      if (vitals.cumulativeLayoutShift) {
        addMetricCard(
          "Cumulative Layout Shift",
          vitals.cumulativeLayoutShift.toFixed(3),
          "score",
          margin + 2 * (cardWidth + 10),
          currentY,
          cardWidth
        );
      }

      currentY += 80;

      // Additional metrics
      if (vitals.speedIndex) {
        addMetricCard("Speed Index", Math.round((vitals.speedIndex / 1000) * 10) / 10, "seconds", margin, currentY, cardWidth);
      }

      if (vitals.totalBlockingTime) {
        addMetricCard("Total Blocking Time", Math.round(vitals.totalBlockingTime), "ms", margin + cardWidth + 10, currentY, cardWidth);
      }

      if (vitals.timeToInteractive) {
        addMetricCard(
          "Time to Interactive",
          Math.round((vitals.timeToInteractive / 1000) * 10) / 10,
          "seconds",
          margin + 2 * (cardWidth + 10),
          currentY,
          cardWidth
        );
      }

      currentY += 80;
    }

    // === PRIORITY ISSUES ===
    const collectIssues = () => {
      console.log("=== COLLECT ISSUES DEBUG ===");
      const entries = [];
      const pushIssues = (category, list) => {
        console.log(`Pushing issues for ${category}:`, list);
        (list || []).forEach((issue) => {
          const entry = {
            category,
            issue,
            priority: category === "SEO" || category === "Performance" ? "high" : category === "Mobile" ? "medium" : "low",
          };
          console.log(`Adding entry:`, entry);
          entries.push(entry);
        });
      };

      pushIssues("Performance", auditData.performance?.issues || []);
      pushIssues("SEO", auditData.seo?.issues || []);
      pushIssues("Mobile", auditData.mobileFriendly?.issues || []);
      pushIssues("Technical", auditData.technical?.issues || []);
      pushIssues("Content", auditData.content?.issues || []);

      console.log("All entries before sorting:", entries);
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      entries.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      console.log("Entries after sorting:", entries);
      const result = entries.slice(0, 8);
      console.log("Final result (top 8):", result);
      return result;
    };

    const fixNext = collectIssues();
    console.log("=== PRIORITY ISSUES DEBUG ===");
    console.log("collectIssues() returned:", fixNext);
    console.log("fixNext.length:", fixNext.length);

    if (fixNext.length > 0) {
      addSectionHeader("Priority Issues to Fix", "FX");

      fixNext.forEach((item, index) => {
        console.log(`Processing issue ${index + 1}:`, item);
        checkPageBreak(40);

        const priorityColor = item.priority === "high" ? colors.danger : item.priority === "medium" ? colors.warning : colors.gray500;

        // Issue card
        drawRoundedRect(margin, currentY, contentWidth, 35, 8, colors.white, colors.gray200);

        // Priority indicator
        doc.rect(margin, currentY, 6, 35).fillColor(priorityColor).fill();

        // Issue number
        doc
          .circle(margin + 25, currentY + 17, 10)
          .fillColor(priorityColor)
          .fill();
        doc.fontSize(8).fillColor(colors.white);
        safeText((index + 1).toString(), margin + 22, currentY + 14);

        // Category badge
        doc.fontSize(8).fillColor(colors.white);
        drawRoundedRect(margin + 45, currentY + 8, 60, 18, 9, priorityColor);
        safeText(item.category, margin + 50, currentY + 13, { width: 50, align: "center" });

        // Issue text
        doc.fontSize(10).fillColor(colors.gray700);
        safeText(item.issue, margin + 115, currentY + 12, { width: contentWidth - 125 });

        currentY += 45;
      });
    }

    // Start new page for detailed analysis
    addPage();

    // === DETAILED ANALYSIS ===
    addSectionHeader("Detailed Analysis", "DA");

    const addDetailedSection = (title, data, icon) => {
      checkPageBreak(100);

      // Section header
      drawRoundedRect(margin, currentY, contentWidth, 40, 8, colors.gray50, colors.gray200);
      doc.fontSize(14).fillColor(colors.primary);
      safeText(`${icon} ${title}`, margin + 15, currentY + 15);

      // Score
      const score = data?.score || 0;
      const scoreColor = getScoreColor(score);
      drawRoundedRect(margin + contentWidth - 80, currentY + 10, 60, 20, 10, scoreColor);
      doc.fontSize(10).fillColor(colors.white);
      safeText(`${score}/100`, margin + contentWidth - 65, currentY + 17);

      currentY += 50;

      // Issues
      if (data?.issues && data.issues.length > 0) {
        doc.fontSize(11).fillColor(colors.gray700);
        safeText("Issues Found:", margin + 15, currentY);
        currentY += 20;

        data.issues.slice(0, 5).forEach((issue) => {
          checkPageBreak(25);
          doc.fontSize(9).fillColor(colors.danger);
          safeText("•", margin + 25, currentY);
          doc.fillColor(colors.gray600);
          safeText(issue, margin + 35, currentY, { width: contentWidth - 60 });
          currentY += 15;
        });

        currentY += 10;
      }

      // Suggestions
      if (data?.suggestions && data.suggestions.length > 0) {
        doc.fontSize(11).fillColor(colors.gray700);
        safeText("Recommendations:", margin + 15, currentY);
        currentY += 20;

        data.suggestions.slice(0, 5).forEach((suggestion) => {
          checkPageBreak(25);
          doc.fontSize(9).fillColor(colors.success);
          safeText("+", margin + 25, currentY);
          doc.fillColor(colors.gray600);
          safeText(suggestion, margin + 35, currentY, { width: contentWidth - 60 });
          currentY += 15;
        });
      }

      currentY += 30;
    };

    addDetailedSection("Performance", auditData.performance, "PERF");
    addDetailedSection("SEO Optimization", auditData.seo, "SEO");
    addDetailedSection("Mobile Friendliness", auditData.mobileFriendly, "MOB");
    addDetailedSection("Accessibility", auditData.accessibility, "ACC");
    addDetailedSection("Technical SEO", auditData.technical, "TECH");

    // === TECHNICAL DETAILS ===
    checkPageBreak(200);
    addSectionHeader("Technical Details", "TD");

    // Meta tags section
    const metaTags = auditData.metaTags || {};
    drawRoundedRect(margin, currentY, contentWidth, 120, 12, colors.white, colors.gray200);

    doc.fontSize(12).fillColor(colors.primary);
    safeText("Meta Tags Analysis", margin + 20, currentY + 15);

    doc.fontSize(10).fillColor(colors.gray700);
    safeText("Title:", margin + 20, currentY + 40);
    doc.fontSize(9).fillColor(colors.gray600);
    safeText(metaTags.title || "Not found", margin + 60, currentY + 40, { width: contentWidth - 100 });

    doc.fontSize(10).fillColor(colors.gray700);
    safeText("Length:", margin + 20, currentY + 55);
    doc.fontSize(9).fillColor(colors.gray600);
    safeText(`${metaTags.titleLength || 0} characters`, margin + 70, currentY + 55);

    doc.fontSize(10).fillColor(colors.gray700);
    safeText("Description:", margin + 20, currentY + 75);
    doc.fontSize(9).fillColor(colors.gray600);
    safeText(metaTags.description || "Not found", margin + 90, currentY + 75, { width: contentWidth - 130 });

    doc.fontSize(10).fillColor(colors.gray700);
    safeText("Length:", margin + 20, currentY + 95);
    doc.fontSize(9).fillColor(colors.gray600);
    safeText(`${metaTags.descriptionLength || 0} characters`, margin + 70, currentY + 95);

    currentY += 140;

    // Keywords section
    if (auditData.content?.topKeywords?.length) {
      checkPageBreak(150);
      drawRoundedRect(margin, currentY, contentWidth, 120, 12, colors.white, colors.gray200);

      doc.fontSize(12).fillColor(colors.primary);
      safeText("Top Keywords", margin + 20, currentY + 15);

      const keywords = auditData.content.topKeywords.slice(0, 9);
      const cols = 3;
      const colWidth = (contentWidth - 80) / cols;

      keywords.forEach((k, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = margin + 20 + col * colWidth;
        const y = currentY + 40 + row * 20;

        doc.fontSize(9).fillColor(colors.gray700);
        safeText(k.keyword, x, y);
        doc.fontSize(8).fillColor(colors.primary);
        safeText(`${k.density}%`, x + 80, y);
      });

      currentY += 140;
    }

    // Images and links stats
    checkPageBreak(100);
    const statsY = currentY;
    const statWidth = (contentWidth - 20) / 2;

    // Images stats
    drawRoundedRect(margin, statsY, statWidth, 80, 12, colors.white, colors.gray200);
    doc.fontSize(12).fillColor(colors.primary);
    safeText("Images", margin + 20, statsY + 15);

    const images = auditData.images || {};
    doc.fontSize(10).fillColor(colors.gray700);
    safeText(`Total: ${images.total || 0}`, margin + 20, statsY + 35);
    safeText(`Without Alt: ${images.withoutAlt || 0}`, margin + 20, statsY + 50);

    // Links stats
    drawRoundedRect(margin + statWidth + 20, statsY, statWidth, 80, 12, colors.white, colors.gray200);
    doc.fontSize(12).fillColor(colors.primary);
    safeText("Links", margin + statWidth + 40, statsY + 15);

    const links = auditData.links || {};
    doc.fontSize(10).fillColor(colors.gray700);
    safeText(`Total: ${links.total || 0}`, margin + statWidth + 40, statsY + 35);
    safeText(`External: ${links.external || 0}`, margin + statWidth + 40, statsY + 50);

    currentY += 100;

    // === COMPETITOR COMPARISON ===
    if (competitors && competitors.length > 0) {
      console.log("Adding competitor comparison section");
      checkPageBreak(200);
      addSectionHeader("Competitor Analysis", "CA");

      // Competitor comparison table
      const tableY = currentY;
      const colWidth = (contentWidth - 120) / 4; // Website, Overall, Performance, SEO

      // Table header
      drawRoundedRect(margin, tableY, contentWidth, 30, 8, colors.gray100, colors.gray200);
      doc.fontSize(10).fillColor(colors.gray700);
      safeText("Website", margin + 10, tableY + 10);
      safeText("Overall", margin + 120, tableY + 10);
      safeText("Performance", margin + 120 + colWidth, tableY + 10);
      safeText("SEO", margin + 120 + 2 * colWidth, tableY + 10);
      safeText("Mobile", margin + 120 + 3 * colWidth, tableY + 10);

      currentY = tableY + 40;

      // Your website (main audit)
      drawRoundedRect(margin, currentY, contentWidth, 25, 4, colors.light, colors.gray200);
      doc.fontSize(9).fillColor(colors.dark);
      safeText("Your Website", margin + 10, currentY + 8);
      doc.fontSize(10).fillColor(colors.primary);
      safeText(auditData.overallScore.toString(), margin + 120, currentY + 8);
      safeText((auditData.performance?.score || 0).toString(), margin + 120 + colWidth, currentY + 8);
      safeText((auditData.seo?.score || 0).toString(), margin + 120 + 2 * colWidth, currentY + 8);
      safeText((auditData.mobileFriendly?.score || 0).toString(), margin + 120 + 3 * colWidth, currentY + 8);

      currentY += 35;

      // Competitors
      competitors.slice(0, 5).forEach((competitor, index) => {
        checkPageBreak(30);

        const rowColor = index % 2 === 0 ? colors.white : colors.gray50;
        drawRoundedRect(margin, currentY, contentWidth, 25, 4, rowColor, colors.gray200);

        doc.fontSize(9).fillColor(colors.gray700);
        const competitorName = competitor.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
        safeText(competitorName.length > 30 ? competitorName.substring(0, 27) + "..." : competitorName, margin + 10, currentY + 8);

        doc.fontSize(10);
        const overallColor = getScoreColor(competitor.overallScore || 0).includes("green")
          ? colors.success
          : getScoreColor(competitor.overallScore || 0).includes("yellow")
          ? colors.warning
          : colors.danger;
        doc.fillColor(overallColor);
        safeText((competitor.overallScore || 0).toString(), margin + 120, currentY + 8);

        doc.fillColor(colors.gray600);
        safeText((competitor.performance?.score || 0).toString(), margin + 120 + colWidth, currentY + 8);
        safeText((competitor.seo?.score || 0).toString(), margin + 120 + 2 * colWidth, currentY + 8);
        safeText((competitor.mobileFriendly?.score || 0).toString(), margin + 120 + 3 * colWidth, currentY + 8);

        currentY += 30;
      });

      currentY += 20;

      // Comparison insights
      const avgCompetitorScore = competitors.reduce((sum, comp) => sum + (comp.overallScore || 0), 0) / competitors.length;
      const yourAdvantage = auditData.overallScore - avgCompetitorScore;

      drawRoundedRect(margin, currentY, contentWidth, 60, 8, colors.gray50, colors.gray200);
      doc.fontSize(12).fillColor(colors.primary);
      safeText("Competitive Analysis", margin + 20, currentY + 15);

      doc.fontSize(10).fillColor(colors.gray700);
      if (yourAdvantage > 0) {
        safeText(`Your website outperforms competitors by ${Math.round(yourAdvantage)} points on average.`, margin + 20, currentY + 35);
      } else if (yourAdvantage < 0) {
        safeText(
          `Your website trails competitors by ${Math.round(Math.abs(yourAdvantage))} points on average.`,
          margin + 20,
          currentY + 35
        );
      } else {
        safeText("Your website performs similarly to your competitors.", margin + 20, currentY + 35);
      }

      currentY += 80;
    }

    // === FOOTER ===
    checkPageBreak(80);

    // Footer background
    drawRoundedRect(margin, currentY, contentWidth, 60, 12, colors.gray100);

    doc.fontSize(10).fillColor(colors.gray600);
    safeText(`Report generated by ${userData.companyName || "SEO Audit Pro"}`, margin + 20, currentY + 20, {
      width: contentWidth - 40,
      align: "center",
    });

    doc.fontSize(8).fillColor(colors.gray500);
    safeText("This report is confidential and intended for the recipient only.", margin + 20, currentY + 40, {
      width: contentWidth - 40,
      align: "center",
    });

    console.log("Beautiful PDF report generated successfully");
    return doc;
  }

  async generatePDFBuffer(auditData, userData, competitors = []) {
    try {
      console.log("=== PDF GENERATION START ===");
      console.log("userData:", JSON.stringify(userData, null, 2));
      console.log("userData.logoUrl:", userData.logoUrl);
      console.log("auditData summary:");
      console.log("  - websiteUrl:", auditData.websiteUrl);
      console.log("  - overallScore:", auditData.overallScore);
      console.log("  - performance issues:", auditData.performance?.issues?.length || 0);
      console.log("  - seo issues:", auditData.seo?.issues?.length || 0);
      console.log("  - mobile issues:", auditData.mobileFriendly?.issues?.length || 0);
      console.log("  - technical issues:", auditData.technical?.issues?.length || 0);
      console.log("  - content issues:", auditData.content?.issues?.length || 0);

      // Validate input data
      if (!auditData || !userData) {
        throw new Error("Missing audit data or user data");
      }

      // Ensure auditData has required structure
      const safeAuditData = {
        websiteUrl: auditData.websiteUrl || "Unknown",
        overallScore: auditData.overallScore || 0,
        performance: auditData.performance || { score: 0, issues: [], suggestions: [] },
        seo: auditData.seo || { score: 0, issues: [], suggestions: [] },
        mobileFriendly: auditData.mobileFriendly || { score: 0, issues: [], suggestions: [] },
        accessibility: auditData.accessibility || { score: 0, issues: [], suggestions: [] },
        technical: auditData.technical || { score: 0, issues: [], suggestions: [] },
        content: auditData.content || { score: 0, issues: [], suggestions: [], topKeywords: [] },
        metaTags: auditData.metaTags || {},
        images: auditData.images || { total: 0, withoutAlt: 0 },
        links: auditData.links || { total: 0, external: 0 },
      };

      // Preload logo buffer (remote or local) if provided
      let logoBuffer = null;
      console.log("=== LOGO LOADING START ===");
      console.log("userData.logoUrl exists:", !!userData.logoUrl);
      console.log("userData.logoUrl value:", userData.logoUrl);

      try {
        if (userData.logoUrl) {
          console.log("Attempting to load logo...");
          if (/^https?:\/\//i.test(userData.logoUrl)) {
            console.log("Loading remote logo from:", userData.logoUrl);
            const resp = await axios.get(userData.logoUrl, {
              responseType: "arraybuffer",
              timeout: 10000,
              headers: {
                "User-Agent": "Mozilla/5.0 (compatible; SEO-Audit-Tool/1.0)",
              },
            });
            logoBuffer = Buffer.from(resp.data);
            console.log("Remote logo loaded successfully. Buffer size:", logoBuffer.length);
          } else {
            const filename = path.basename(userData.logoUrl);
            const localPath = path.join(__dirname, "../uploads/logos", filename);
            console.log("Attempting to load local logo from:", localPath);
            if (fs.existsSync(localPath)) {
              logoBuffer = fs.readFileSync(localPath);
              console.log("Local logo loaded successfully. Buffer size:", logoBuffer.length);
            } else {
              console.warn("Local logo file not found:", localPath);
            }
          }
        } else {
          console.log("No logoUrl provided in userData");
        }
      } catch (logoError) {
        console.error("Logo loading failed:", logoError.message);
        console.error("Logo error stack:", logoError.stack);
        logoBuffer = null;
      }

      console.log("Final logoBuffer:", logoBuffer ? `Buffer(${logoBuffer.length} bytes)` : "null");
      console.log("=== LOGO LOADING END ===");

      return new Promise((resolve, reject) => {
        try {
          const doc = this.generateReport(safeAuditData, userData, logoBuffer, competitors);

          // Debug check
          if (!doc || typeof doc.on !== "function") {
            console.error("Invalid document object returned from generateReport:", typeof doc);
            return reject(new Error("Failed to create PDF document"));
          }

          const chunks = [];

          doc.on("data", (chunk) => chunks.push(chunk));
          doc.on("end", () => {
            const buffer = Buffer.concat(chunks);
            console.log(`Beautiful PDF generated successfully, size: ${buffer.length} bytes`);
            resolve(buffer);
          });
          doc.on("error", (error) => {
            console.error("PDF generation error:", error);
            reject(error);
          });

          doc.end();
        } catch (error) {
          console.error("PDF creation error:", error);
          reject(error);
        }
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }
}

module.exports = new PDFReportService();
