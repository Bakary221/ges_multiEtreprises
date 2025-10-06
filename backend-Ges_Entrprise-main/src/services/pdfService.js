const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

class PDFService {
  // Générer un bulletin de paie PDF
  async generatePayslipPDF(payslipId) {
    const payslip = await prisma.payslip.findUnique({
      where: { id: parseInt(payslipId) },
      include: {
        employee: {
          include: {
            company: true,
            department: true
          }
        },
        payrun: true,
        payments: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });

    if (!payslip) {
      throw new Error('Payslip not found');
    }

    // Créer le dossier uploads/payslips s'il n'existe pas
    const payslipsDir = path.join(process.cwd(), 'uploads', 'payslips');
    if (!fs.existsSync(payslipsDir)) {
      fs.mkdirSync(payslipsDir, { recursive: true });
    }

    const filename = `payslip_${payslipId}_${Date.now()}.pdf`;
    const filepath = path.join(payslipsDir, filename);

    // Créer le document PDF avec des marges optimisées et encodage UTF-8
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
      info: {
        Title: 'Bulletin de Paie',
        Author: 'PayrollSys',
        Subject: 'Bulletin de salaire'
      }
    });

    // Utiliser une police avec meilleur support UTF-8
    doc.font('Times-Roman');

    // Pipe vers le fichier
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Ajouter des couleurs et un style professionnel
    this.addStyledHeader(doc, payslip);

    // Informations employé avec un design amélioré
    this.addStyledEmployeeInfo(doc, payslip);

    // Détails de paie avec un tableau stylisé
    this.addStyledPayDetails(doc, payslip);

    // Section signature améliorée
    this.addStyledSignatureSection(doc, payslip);

    // Pied de page
    this.addFooter(doc, payslip);

    // Finaliser le PDF
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        const pdfUrl = `/uploads/payslips/${filename}`;
        resolve({
          filepath,
          filename,
          pdfUrl,
          generatedAt: new Date()
        });
      });
      stream.on('error', reject);
    });
  }

  // Générer un reçu de paiement PDF
  async generatePaymentReceiptPDF(paymentId) {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) },
      include: {
        payslip: {
          include: {
            employee: {
              include: {
                company: true
              }
            },
            payrun: true
          }
        }
      }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Créer le dossier uploads/receipts s'il n'existe pas
    const receiptsDir = path.join(process.cwd(), 'uploads', 'receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const filename = `receipt_${paymentId}_${Date.now()}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    // Créer le document PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Pipe vers le fichier
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // En-tête avec logo et informations entreprise
    this.addCompanyHeader(doc, payment.payslip.employee.company);

    // Titre du reçu
    doc.moveDown(2);
    doc.fontSize(20).font('Helvetica-Bold').text('REÇU DE PAIEMENT', { align: 'center' });
    doc.moveDown(1);

    // Informations du paiement
    this.addPaymentInfo(doc, payment);

    // Signature
    this.addReceiptSignature(doc);

    // Finaliser le PDF
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        const pdfUrl = `/uploads/receipts/${filename}`;
        resolve({
          filepath,
          filename,
          pdfUrl,
          generatedAt: new Date()
        });
      });
      stream.on('error', reject);
    });
  }

  addStyledHeader(doc, payslip) {
    const company = payslip.employee.company;

    // Rectangle d'en-tête coloré
    doc.rect(0, 0, doc.page.width, 100).fill('#1e40af'); // Bleu foncé

    // Logo et nom de l'entreprise en blanc
    doc.fillColor('white').fontSize(24).font('Times-Bold');
    doc.text(company.name, 40, 30, { align: 'left' });

    // Slogan ou description
    doc.fontSize(10).font('Times-Roman');
    doc.text('Système de Gestion de Paie', 40, 60);

    // Informations de contact à droite
    doc.fontSize(8);
    const contactY = 30;
    doc.text(`Email: ${company.settings?.email || 'contact@company.com'}`, 400, contactY);
    doc.text(`Tel: ${company.settings?.phone || '+221 XX XXX XX XX'}`, 400, contactY + 15);
    doc.text(`Adresse: ${company.settings?.address || 'Adresse de l\'entreprise'}`, 400, contactY + 30);

    // Titre du bulletin avec un fond coloré
    doc.rect(0, 120, doc.page.width, 40).fill('#f3f4f6');
    doc.fillColor('black').fontSize(18).font('Times-Bold');
    doc.text('BULLETIN DE PAIE', 0, 135, { align: 'center', width: doc.page.width });

    // Numéro du bulletin et période
    doc.fontSize(10).font('Times-Roman');
    doc.text(`N° ${payslip.id.toString().padStart(6, '0')}`, 40, 170);
    doc.text(`Période: ${payslip.payrun.month}`, 400, 170);

    doc.moveDown(3);
  }

  addStyledEmployeeInfo(doc, payslip) {
    const employee = payslip.employee;

    // Section avec fond gris clair
    const sectionY = doc.y;
    doc.rect(40, sectionY, doc.page.width - 80, 80).fill('#f9fafb');

    // Titre de section
    doc.fillColor('black').fontSize(12).font('Times-Bold');
    doc.text('INFORMATIONS EMPLOYÉ', 50, sectionY + 10);

    // Ligne séparatrice
    doc.moveTo(50, sectionY + 25).lineTo(doc.page.width - 50, sectionY + 25).stroke('#1e40af');

    // Informations en deux colonnes
    doc.fontSize(9).font('Times-Roman');

    const leftX = 60;
    const rightX = 300;
    const startY = sectionY + 35;

    // Colonne gauche
    const nameText = `Nom complet: ${employee.name}`;
    const matriculeText = `Matricule: ${employee.matricule || 'N/A'}`;
    const positionText = `Poste: ${employee.position}`;
    const departmentText = `Département: ${employee.department?.name || 'N/A'}`;

    doc.text(Buffer.from(nameText, 'utf8').toString(), leftX, startY);
    doc.text(Buffer.from(matriculeText, 'utf8').toString(), leftX, startY + 12);
    doc.text(Buffer.from(positionText, 'utf8').toString(), leftX, startY + 24);
    doc.text(Buffer.from(departmentText, 'utf8').toString(), leftX, startY + 36);

    // Colonne droite
    doc.text(`📅 Période: ${payslip.payrun.month}`, rightX, startY);
    doc.text(`📄 Date d'émission: ${new Date().toLocaleDateString('fr-FR')}`, rightX, startY + 12);
    doc.text(`Statut: ${payslip.payments.length > 0 ? 'Payé' : 'En attente'}`, rightX, startY + 24);

    doc.y = sectionY + 90;
  }

  addStyledPayDetails(doc, payslip) {
    // Calculs des éléments de paie
    const grossSalary = payslip.employee.salary;
    const hoursWorked = 160; // Hypothèse
    const hourlyRate = grossSalary / hoursWorked;
    const deductions = grossSalary * 0.2; // 20% déductions
    const netSalary = payslip.netSalary;

    // Titre de section
    doc.moveDown(1);
    doc.fontSize(12).font('Times-Bold').fillColor('black');
    doc.text('DETAILS DE REMUNERATION', { align: 'center' });
    doc.moveDown(0.5);

    // Tableau stylisé
    const tableTop = doc.y;
    const tableWidth = doc.page.width - 80;
    const rowHeight = 25;
    const colWidths = [tableWidth * 0.5, tableWidth * 0.25, tableWidth * 0.25];

    // Fonction pour dessiner une ligne du tableau
    const drawTableRow = (y, texts, isHeader = false, isTotal = false) => {
      // Fond de ligne
      let fillColor = 'white';
      if (isHeader) fillColor = '#1e40af';
      else if (isTotal) fillColor = '#dbeafe';

      doc.rect(40, y, tableWidth, rowHeight).fill(fillColor);

      // Bordures
      doc.strokeColor('#e5e7eb').lineWidth(0.5);
      doc.rect(40, y, tableWidth, rowHeight).stroke();

      // Lignes verticales
      let currentX = 40;
      for (let i = 0; i < colWidths.length - 1; i++) {
        currentX += colWidths[i];
        doc.moveTo(currentX, y).lineTo(currentX, y + rowHeight).stroke();
      }

      // Texte
      const textColor = isHeader ? 'white' : 'black';
      const fontWeight = isHeader || isTotal ? 'Times-Bold' : 'Times-Roman';

      doc.fillColor(textColor).font(fontWeight).fontSize(9);

      texts.forEach((text, index) => {
        let x = 40 + 5; // Marge gauche
        for (let i = 0; i < index; i++) {
          x += colWidths[i];
        }

        const align = index === 0 ? 'left' : 'right';
        const width = colWidths[index] - 10;

        doc.text(text, x, y + 8, { width, align });
      });
    };

    // En-têtes
    drawTableRow(tableTop, ['Description', 'Montant', 'Type'], true);

    // Lignes de données
    let currentY = tableTop + rowHeight;
    drawTableRow(currentY, [`Salaire brut (${hoursWorked}h)`, `${grossSalary.toLocaleString('fr-FR')} FCFA`, 'Revenus'], false);

    currentY += rowHeight;
    drawTableRow(currentY, ['Taux horaire', `${hourlyRate.toFixed(2)} FCFA/h`, 'Calcul'], false);

    currentY += rowHeight;
    drawTableRow(currentY, ['Déductions (20%)', `${deductions.toLocaleString('fr-FR')} FCFA`, 'Retenues'], false);

    // Ligne totale
    currentY += rowHeight;
    drawTableRow(currentY, ['Salaire net à payer', `${netSalary.toLocaleString('fr-FR')} FCFA`, 'Net'], false, true);

    doc.y = currentY + rowHeight + 20;
  }

  addStyledSignatureSection(doc, payslip) {
    doc.moveDown(2);

    // Section signatures avec fond
    const signatureY = doc.y;
    doc.rect(40, signatureY, doc.page.width - 80, 80).fill('#f9fafb');

    doc.fillColor('black').fontSize(10).font('Times-Bold');
    doc.text('SIGNATURES', 50, signatureY + 10, { align: 'center', width: doc.page.width - 100 });

    // Ligne séparatrice
    doc.moveTo(50, signatureY + 25).lineTo(doc.page.width - 50, signatureY + 25).stroke('#1e40af');

    const sigY = signatureY + 35;

    // Signature entreprise (gauche)
    doc.fontSize(9).font('Times-Roman');
    doc.text('Signature de l\'employeur', 70, sigY);
    doc.text('(Direction RH)', 70, sigY + 10);
    doc.moveTo(70, sigY + 25).lineTo(170, sigY + 25).stroke('#1e40af');

    // Signature employé (droite)
    doc.text('Signature de l\'employé', 320, sigY);
    doc.text('(Reçu conforme)', 320, sigY + 10);
    doc.moveTo(320, sigY + 25).lineTo(420, sigY + 25).stroke('#1e40af');

    doc.y = signatureY + 90;
  }

  addFooter(doc, payslip) {
    const footerY = doc.page.height - 50;

    // Ligne séparatrice
    doc.strokeColor('#e5e7eb').lineWidth(1);
    doc.moveTo(40, footerY - 10).lineTo(doc.page.width - 40, footerY - 10).stroke();

    // Informations de bas de page
    doc.fillColor('#6b7280').fontSize(7).font('Times-Roman');
    doc.text('Ce document est généré automatiquement par PayrollSys - Système de Gestion de Paie', 40, footerY, { align: 'center', width: doc.page.width - 80 });

    doc.text(`Document généré le ${new Date().toLocaleString('fr-FR')} • ID: ${payslip.id}`, 40, footerY + 8, { align: 'center', width: doc.page.width - 80 });

    // Note de confidentialité
    doc.text('Document confidentiel - Ne pas divulguer sans autorisation', 40, footerY + 16, { align: 'center', width: doc.page.width - 80 });
  }

  addPaymentInfo(doc, payment) {
    doc.fontSize(12).font('Helvetica-Bold').text('INFORMATIONS DE PAIEMENT');
    doc.moveDown(0.5);

    const payslip = payment.payslip;
    const employee = payslip.employee;

    doc.fontSize(10).font('Helvetica');

    const leftColumnX = 50;
    const rightColumnX = 300;

    // Informations de base
    doc.text(`Employé: ${employee.name}`, leftColumnX, doc.y);
    doc.text(`Matricule: ${employee.matricule || 'N/A'}`, leftColumnX, doc.y);
    doc.text(`Montant payé: ${payslip.netSalary.toFixed(2)} FCFA`, leftColumnX, doc.y);
    doc.text(`Méthode: ${payment.method}`, leftColumnX, doc.y);

    // Informations de paiement
    doc.text(`Date de paiement: ${new Date(payment.date).toLocaleDateString('fr-FR')}`, rightColumnX, doc.y - 40);
    doc.text(`Période: ${payslip.payrun.month}`, rightColumnX, doc.y);
    doc.text(`Numéro de reçu: REC-${payment.id}`, rightColumnX, doc.y);

    doc.moveDown(2);
  }

  addReceiptSignature(doc) {
    doc.fontSize(10).font('Helvetica');

    const signatureY = doc.page.height - 120;

    doc.text('Reçu par:', 50, signatureY);
    doc.moveTo(50, signatureY + 20).lineTo(150, signatureY + 20).stroke();
    doc.text('Signature', 50, signatureY + 25);

    doc.text('Le caissier', 300, signatureY);
    doc.moveTo(300, signatureY + 20).lineTo(400, signatureY + 20).stroke();
    doc.text('Signature', 300, signatureY + 25);

    doc.moveDown(2);
    doc.fontSize(8).text(`Document généré le ${new Date().toLocaleString('fr-FR')}`, { align: 'center' });
  }
}

module.exports = new PDFService();