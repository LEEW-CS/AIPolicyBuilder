import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import type { Answers, PolicySection } from '../types';
import { buildPolicySections } from '../policy/builder';
import { strAnswer } from '../policy/helpers';

/**
 * Client-side DOCX generation using the `docx` library. Recognises
 * bullet lines (prefixed with "• " or "- ") and emits them as a Word
 * bullet list; everything else becomes a body paragraph. Heading rows
 * use HEADING_2 so the resulting document gets a usable outline view.
 *
 * Must be called from the browser. The Next.js entry point imports
 * this dynamically.
 */
export async function downloadDOCX(answers: Answers): Promise<void> {
  const sections: PolicySection[] = buildPolicySections(answers);
  const company = strAnswer(answers, 'company') || 'Company';

  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `AI Use Policy — ${company}`,
          bold: true,
          size: 36,
          color: '0B1B3A',
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // First section is the header info — render its lines as muted paragraphs.
  for (const line of sections[0].body.split('\n')) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: line, color: '6B7280', size: 20 })],
      })
    );
  }
  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  for (const section of sections.slice(1)) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: section.heading, bold: true, size: 26, color: '0B1B3A' }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      })
    );

    for (const para of section.body.split('\n\n')) {
      const lines = para.split('\n');
      const isBullets = lines.every((l) => /^[•\-]\s/.test(l.trim()));
      if (isBullets) {
        for (const l of lines) {
          children.push(
            new Paragraph({
              text: l.trim().replace(/^[•\-]\s*/, ''),
              bullet: { level: 0 },
              spacing: { after: 60 },
            })
          );
        }
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: para, size: 22, color: '1F2937' })],
            spacing: { after: 140 },
          })
        );
      }
    }
  }

  const doc = new Document({
    creator: 'Cloudstaff AI Policy Builder',
    title: `AI Use Policy — ${company}`,
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `AI-Policy-${company.replace(/[^A-Za-z0-9]+/g, '-')}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
