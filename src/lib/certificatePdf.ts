import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Certificate {
  id: string;
  name: string;
  course: string;
  grade: string;
  issueDate: string;
  status: string;
  type: string;
  issuer: string;
}

/**
 * Generates and downloads a premium landscape PDF certificate for a verified student credential.
 */
export async function generateCertificatePdf(certificate: Certificate) {
  try {
    // Fetch custom design template from Firestore if available
    let design = {
      title: "Certificate of Competency",
      subtitle1: "This document certifies that the following candidate has successfully completed all required training modules,",
      subtitle2: "coding assignments, and guided industry internships under real software development environment standards.",
      signatoryName: "N. Sandeep",
      signatoryTitle: "DIRECTOR, SANDEVEX LABS",
      signatorySub: "Sand-Hut Tech Solutions",
      sealS: "S",
      footerText: "POWERED BY SAND-HUT TECH SOLUTIONS  •  ISO 9001:2015 ACCREDITED"
    };

    try {
      const q = query(
        collection(db, "certificate_designs"),
        where("type", "==", certificate.type)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        design = {
          title: data.title || design.title,
          subtitle1: data.subtitle1 || design.subtitle1,
          subtitle2: data.subtitle2 || design.subtitle2,
          signatoryName: data.signatoryName || design.signatoryName,
          signatoryTitle: data.signatoryTitle || design.signatoryTitle,
          signatorySub: data.signatorySub || design.signatorySub,
          sealS: data.sealS || design.sealS,
          footerText: data.footerText || design.footerText
        };
      }
    } catch (err) {
      console.error("Failed to load custom certificate design template:", err);
    }

    // 1. Initialize A4 Landscape PDF (297mm x 210mm)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 297;
    const pageHeight = 210;

    // 2. Dynamic Verification URL pointing to this specific certificate
    const verificationUrl = typeof window !== "undefined"
      ? `${window.location.origin}/verify?id=${encodeURIComponent(certificate.id)}`
      : `https://sandevex-2026.firebaseapp.com/verify?id=${encodeURIComponent(certificate.id)}`;

    // 3. Generate QR Code Data URL (Base64 PNG)
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 250,
      color: {
        dark: "#0f172a", // slate-900
        light: "#ffffff",
      },
    });

    // --- DRAW PREMIUM VISUALS ---

    // A. Elegant Light Cream Background Fill (#fdfbf7)
    doc.setFillColor(253, 251, 247);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // B. Inner Dark Slate Border (#0f172a)
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1.2);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16, "D");

    // C. Outer Elegant Gold/Amber Thin Border (#d97706)
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.6);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, "D");

    // D. Corner Classical Gold Accents
    doc.setFillColor(217, 119, 6);
    // Top-Left corner accent
    doc.rect(12, 12, 4, 4, "F");
    // Top-Right corner accent
    doc.rect(pageWidth - 16, 12, 4, 4, "F");
    // Bottom-Left corner accent
    doc.rect(12, pageHeight - 16, 4, 4, "F");
    // Bottom-Right corner accent
    doc.rect(pageWidth - 16, pageHeight - 16, 4, 4, "F");

    // --- HEADER SECTION ---

    // Circular Gold Seal at Top Center
    const sealX = pageWidth / 2;
    const sealY = 30;
    doc.setFillColor(251, 191, 36); // amber-400
    doc.ellipse(sealX, sealY, 11, 11, "F");

    doc.setDrawColor(217, 119, 6); // amber-600
    doc.setLineWidth(0.6);
    doc.ellipse(sealX, sealY, 12.2, 12.2, "D");

    // Stylized "S" inside seal
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(design.sealS, sealX, sealY + 3.8, { align: "center" });

    // Brand Header
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("SANDEVEX LABS & REGISTRY NETWORK", sealX, 48, { align: "center" });

    // --- MAIN CERTIFICATE TEXT ---

    // Title: Certificate of Competency
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.text(design.title, sealX, 61, { align: "center" });

    // Elegant subtitle
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(
      design.subtitle1,
      sealX,
      72,
      { align: "center" }
    );
    doc.text(
      design.subtitle2,
      sealX,
      78,
      { align: "center" }
    );

    // Candidate Name (Very Large, Gold Accent)
    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.setTextColor(180, 83, 9); // amber-800
    doc.text(certificate.name, sealX, 94, { align: "center" });

    // Underline divider for name
    doc.setDrawColor(217, 119, 6); // gold
    doc.setLineWidth(0.5);
    doc.line(sealX - 60, 98, sealX + 60, 98);

    // Course Title Subtitle
    doc.setFont("times", "italic");
    doc.setFontSize(10.5);
    doc.setTextColor(71, 85, 105);
    doc.text("for outstanding academic accomplishments and mastery of the course path", sealX, 105, {
      align: "center",
    });

    // Course Title (Slate, bold)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16.5);
    doc.setTextColor(15, 23, 42);
    doc.text(certificate.course, sealX, 114, { align: "center" });

    // Performance Details
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Awarded with Grade: ${certificate.grade}  •  Issued on ${certificate.issueDate}  •  Credential Status: ${certificate.status}`,
      sealX,
      121,
      { align: "center" }
    );

    // --- BOTTOM SIGNATURES, SECURITY, AND QR SECTION ---

    const bottomY = 145;

    // LEFT COLUMN: Signature & Authority
    const leftColX = 58;
    doc.setFont("times", "italic");
    doc.setFontSize(15);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(design.signatoryName, leftColX, bottomY + 12, { align: "center" });

    // Signature line
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.setLineWidth(0.4);
    doc.line(leftColX - 25, bottomY + 15, leftColX + 25, bottomY + 15);

    // Signature label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(design.signatoryTitle, leftColX, bottomY + 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(design.signatorySub, leftColX, bottomY + 24, { align: "center" });

    // CENTER COLUMN: Registry verification badge
    const centerColX = pageWidth / 2;
    
    // Pill Badge background for "SECURE LEDGER VERIFIED"
    doc.setFillColor(209, 250, 229); // emerald-100 (light green)
    doc.roundedRect(centerColX - 25, bottomY + 3, 50, 7.5, 3.75, 3.75, "F");

    // Pill Badge Text
    doc.setTextColor(6, 95, 70); // emerald-800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("✓ SECURE LEDGER VERIFIED", centerColX, bottomY + 8, { align: "center" });

    // Serial Key
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(`Serial: ${certificate.id}`, centerColX, bottomY + 16, { align: "center" });

    // Secure protocol footnote
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Registry Authority Node: Sand-Hut Mainnet Protocol", centerColX, bottomY + 21, {
      align: "center",
    });

    // RIGHT COLUMN: Dynamic QR Code
    const rightColX = 224;
    const qrSize = 25;

    // QR Border frame
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.rect(rightColX - 1, bottomY + 1, qrSize + 2, qrSize + 2, "D");

    // Add QR Code Image
    doc.addImage(qrCodeDataUrl, "PNG", rightColX, bottomY + 2, qrSize, qrSize);

    // QR Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("SCAN TO VERIFY PATH", rightColX + qrSize / 2, bottomY + 31, { align: "center" });

    // --- FOOTER NOTE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(design.footerText, centerColX, pageHeight - 6, {
      align: "center",
    });

    // 4. Save and trigger PDF download
    const filename = `Sandevex_Certificate_${certificate.name.replace(/\s+/g, "_")}_${certificate.id}.pdf`;
    doc.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error("Error generating certificate PDF:", error);
    throw error;
  }
}
