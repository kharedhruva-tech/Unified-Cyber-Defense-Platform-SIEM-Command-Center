import io
import csv
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

class ReportGenerator:
    """Enterprise Cybersecurity PDF and CSV Report Exporter."""

    @staticmethod
    def generate_pdf_report(report_title: str, summary_metrics: Dict[str, Any], table_data: List[List[str]]) -> bytes:
        """Generates a professional PDF executive report."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        story = []
        styles = getSampleStyleSheet()

        # Title Banner
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            textColor=colors.HexColor('#0B0F17'),
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#64748B'),
            spaceAfter=15
        )

        story.append(Paragraph(report_title, title_style))
        story.append(Paragraph(f"Enterprise Cyber Defense Solution | Confidential Security Audit Report | Generated: {summary_metrics.get('generated_at', '2026-09-19')}", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0284C7'), spaceAfter=15))

        # Executive Metrics Table
        story.append(Paragraph("<b>Executive Summary & Risk Metrics</b>", styles['Heading2']))
        story.append(Spacer(1, 6))

        metric_data = [
            ["Security Posture Score:", f"{summary_metrics.get('posture_score', 82.0)}% ({summary_metrics.get('risk_level', 'Medium')} Risk)"],
            ["Total Monitored Assets:", str(summary_metrics.get('monitored_assets', 12))],
            ["Open Vulnerabilities:", f"{summary_metrics.get('critical_vulns', 2)} Critical | {summary_metrics.get('high_vulns', 5)} High"],
            ["Active Security Incidents:", str(summary_metrics.get('active_incidents', 3))],
            ["System Hardening Score:", f"{summary_metrics.get('hardening_score', 82.0)}% Passed"]
        ]
        
        m_table = Table(metric_data, colWidths=[180, 320])
        m_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#0F172A')),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0'))
        ]))
        story.append(m_table)
        story.append(Spacer(1, 20))

        # Main Table Section
        story.append(Paragraph("<b>Detailed Audit & Finding Inventory</b>", styles['Heading2']))
        story.append(Spacer(1, 8))

        if table_data:
            # Wrap cell contents in Paragraph for auto-wrap
            cell_wrapped = []
            for row in table_data:
                r_wrapped = []
                for idx, cell in enumerate(row):
                    p_style = ParagraphStyle(
                        'CellText',
                        parent=styles['Normal'],
                        fontName='Helvetica-Bold' if row == table_data[0] else 'Helvetica',
                        fontSize=8,
                        textColor=colors.white if row == table_data[0] else colors.HexColor('#1E293B')
                    )
                    r_wrapped.append(Paragraph(str(cell), p_style))
                cell_wrapped.append(r_wrapped)

            main_table = Table(cell_wrapped, repeatRows=1)
            main_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                ('TOPPADDING', (0,0), (-1,-1), 5),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F1F5F9')]),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1'))
            ]))
            story.append(main_table)

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_csv_report(header: List[str], rows: List[List[Any]]) -> str:
        """Generates raw CSV export string."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(header)
        for row in rows:
            writer.writerow(row)
        return output.getvalue()
