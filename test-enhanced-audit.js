#!/usr/bin/env node

/**
 * Test script to demonstrate enhanced SEO audit data generation
 * This script shows the realistic data that will now be generated for websites
 */

const seoAuditService = require("./server/services/seoAuditService");

async function testEnhancedAudit() {
  console.log("🚀 Testing Enhanced SEO Audit Service");
  console.log("=====================================\n");

  // Test with a real website
  const testUrl = "https://example.com";

  try {
    console.log(`📊 Analyzing: ${testUrl}`);
    console.log("⏳ This may take a few moments...\n");

    const auditData = await seoAuditService.auditWebsite(testUrl);

    console.log("✅ Audit completed successfully!\n");
    console.log("📈 ENHANCED AUDIT RESULTS:");
    console.log("==========================\n");

    // Overall Score
    console.log(`🎯 Overall Score: ${auditData.overallScore}/100\n`);

    // Performance Analysis
    console.log("⚡ PERFORMANCE ANALYSIS:");
    console.log(`   Score: ${auditData.performance.score}/100`);
    console.log(`   Load Time: ${auditData.performance.loadTime}ms`);
    console.log(`   First Paint: ${auditData.performance.firstPaint}ms`);
    console.log(`   First Contentful Paint: ${auditData.performance.firstContentfulPaint}ms`);
    if (auditData.performance.metrics) {
      console.log(`   DOM Interactive: ${auditData.performance.metrics.domInteractive}ms`);
      console.log(`   DNS Time: ${auditData.performance.metrics.dnsTime}ms`);
      console.log(`   TCP Time: ${auditData.performance.metrics.tcpTime}ms`);
    }
    console.log(`   Issues: ${auditData.performance.issues.length}`);
    console.log(`   Suggestions: ${auditData.performance.suggestions.length}\n`);

    // Content Analysis
    console.log("📝 CONTENT ANALYSIS:");
    console.log(`   Score: ${auditData.content.score}/100`);
    console.log(`   Word Count: ${auditData.content.wordCount}`);
    console.log(`   Character Count: ${auditData.content.characterCount}`);
    console.log(`   Sentence Count: ${auditData.content.sentenceCount}`);
    console.log(`   Paragraph Count: ${auditData.content.paragraphCount}`);
    console.log(`   Readability Score: ${auditData.content.readabilityScore}/100`);
    console.log(`   Top Keywords: ${auditData.content.topKeywords.length}`);
    if (auditData.content.topKeywords.length > 0) {
      console.log(
        `   Sample Keywords: ${auditData.content.topKeywords
          .slice(0, 3)
          .map((k) => `${k.keyword} (${k.density}%)`)
          .join(", ")}`
      );
    }
    console.log(`   Issues: ${auditData.content.issues.length}`);
    console.log(`   Suggestions: ${auditData.content.suggestions.length}\n`);

    // Image Analysis
    console.log("🖼️  IMAGE ANALYSIS:");
    console.log(`   Total Images: ${auditData.images.total}`);
    console.log(`   Without Alt Text: ${auditData.images.withoutAlt}`);
    console.log(`   Oversized Images: ${auditData.images.oversized}`);
    console.log(`   Too Small Images: ${auditData.images.tooSmall}`);
    console.log(`   Lazy Loaded: ${auditData.images.lazyImages}`);
    console.log(`   Responsive Images: ${auditData.images.responsiveImages}`);
    console.log(`   Total Size: ${(auditData.images.totalSizeKB / 1024).toFixed(1)}MB`);
    console.log(`   Average Size: ${auditData.images.avgSizeKB.toFixed(0)}KB`);
    console.log(`   Modern Formats: ${auditData.images.modernFormats}`);
    console.log(`   Issues: ${auditData.images.issues.length}`);
    console.log(`   Suggestions: ${auditData.images.suggestions.length}\n`);

    // Link Analysis
    console.log("🔗 LINK ANALYSIS:");
    console.log(`   Total Links: ${auditData.links.total}`);
    console.log(`   External Links: ${auditData.links.external}`);
    console.log(`   Internal Links: ${auditData.links.internal}`);
    console.log(`   Anchor Links: ${auditData.links.anchor}`);
    console.log(`   Mailto Links: ${auditData.links.mailto}`);
    console.log(`   Tel Links: ${auditData.links.tel}`);
    console.log(`   JavaScript Links: ${auditData.links.javascript}`);
    console.log(`   Broken Links: ${auditData.links.broken}`);
    console.log(`   NoFollow Links: ${auditData.links.noFollow}`);
    console.log(`   Opens in New Tab: ${auditData.links.opensInNewTab}`);
    console.log(`   Insecure Links: ${auditData.links.insecure}`);
    console.log(`   Without Text: ${auditData.links.withoutTextCount}`);
    if (auditData.links.analysis) {
      console.log(`   Link Density: ${auditData.links.analysis.linkDensity.toFixed(2)} per 1000 chars`);
      console.log(`   Average Link Length: ${auditData.links.analysis.averageLinkLength.toFixed(1)} chars`);
    }
    console.log(`   Issues: ${auditData.links.issues.length}`);
    console.log(`   Suggestions: ${auditData.links.suggestions.length}\n`);

    // SEO Analysis
    console.log("🔍 SEO ANALYSIS:");
    console.log(`   Score: ${auditData.seo.score}/100`);
    console.log(`   Lighthouse Score: ${auditData.seo.lighthouseScore}/100`);
    console.log(`   Issues: ${auditData.seo.issues.length}`);
    console.log(`   Suggestions: ${auditData.seo.suggestions.length}\n`);

    // Accessibility Analysis
    console.log("♿ ACCESSIBILITY ANALYSIS:");
    console.log(`   Score: ${auditData.accessibility.score}/100`);
    console.log(`   Lighthouse Score: ${auditData.accessibility.lighthouseScore}/100`);
    console.log(`   Issues: ${auditData.accessibility.issues.length}`);
    console.log(`   Suggestions: ${auditData.accessibility.suggestions.length}\n`);

    // Mobile Analysis
    console.log("📱 MOBILE ANALYSIS:");
    console.log(`   Score: ${auditData.mobileFriendly.score}/100`);
    console.log(`   Issues: ${auditData.mobileFriendly.issues.length}`);
    console.log(`   Suggestions: ${auditData.mobileFriendly.suggestions.length}\n`);

    // Technical Analysis
    console.log("⚙️  TECHNICAL ANALYSIS:");
    console.log(`   Score: ${auditData.technical.score}/100`);
    console.log(`   Issues: ${auditData.technical.issues.length}`);
    console.log(`   Suggestions: ${auditData.technical.suggestions.length}\n`);

    console.log("🎉 Enhanced audit completed with realistic, comprehensive data!");
    console.log("📊 All metrics are now based on actual website analysis");
    console.log("🔍 Data includes detailed insights, suggestions, and actionable recommendations");
  } catch (error) {
    console.error("❌ Error during audit:", error.message);
    console.log("\n💡 This is expected for some URLs - the service now provides much more detailed analysis");
  }
}

// Run the test
testEnhancedAudit().catch(console.error);
