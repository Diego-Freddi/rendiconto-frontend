import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image
} from '@react-pdf/renderer';
import { raggruppaPerCategoriaPDF } from '../../utils/categoriaUtils';

// Registrazione font (opzionale - usa font di sistema se non specificato)
// Font.register({
//   family: 'Times',
//   src: 'https://fonts.gstatic.com/s/timesnewroman/v1/times-new-roman.ttf'
// });

// Stili per il PDF - Replicano lo stile della pagina dettagli
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  
  // INTESTAZIONE MODERNA
  header: {
    textAlign: 'center',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    borderTop: '1 solid #dee2e6',
    borderBottom: '1 solid #dee2e6',
    paddingVertical: 8,
  },
  period: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 4,
  },
  
  // SEZIONI CON STILE CARD
  section: {
    marginBottom: 20,
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 8,
    border: '1 solid #e9ecef',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 15,
    borderBottom: '2 solid #0d6efd',
    paddingBottom: 6,
  },
  
  // LAYOUT A DUE COLONNE PER DATI GENERALI
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    paddingRight: 12,
  },
  columnLast: {
    flex: 1,
  },
  
  // CARD PER DATI PERSONALI
  card: {
    backgroundColor: '#ffffff',
    border: '1 solid #dee2e6',
    borderRadius: 6,
    marginBottom: 15,
  },
  cardHeader: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderBottom: '1 solid #dee2e6',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#495057',
  },
  cardBody: {
    padding: 12,
  },
  
  // TABELLE MODERNE
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#343a40',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tableHeaderSuccess: {
    backgroundColor: '#198754',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tableHeaderDanger: {
    backgroundColor: '#dc3545',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    borderBottomStyle: 'solid',
    minHeight: 35,
  },
  tableRowStriped: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    flex: 2,
    padding: 10,
    fontSize: 11,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
    borderRightStyle: 'solid',
  },
  tableCellLast: {
    flex: 1,
    padding: 10,
    fontSize: 11,
    justifyContent: 'center',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  tableCellThree: {
    flex: 1,
    padding: 10,
    fontSize: 11,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
    borderRightStyle: 'solid',
  },
  
  // FOOTER TABELLE
  tableFooter: {
    backgroundColor: '#6c757d',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  // TESTO
  text: {
    fontSize: 11,
    marginBottom: 4,
  },
  textBold: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  textMuted: {
    fontSize: 10,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  textSuccess: {
    color: '#198754',
    fontWeight: 'bold',
  },
  textDanger: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  
  // CONDIZIONI PERSONALI
  conditionsCard: {
    backgroundColor: '#ffffff',
    border: '1 solid #dee2e6',
    borderRadius: 6,
    padding: 12,
    minHeight: 80,
  },
  
  // RIEPILOGO GENERALE
  summarySection: {
    marginTop: 30,
  },
  summaryTable: {
    backgroundColor: '#ffffff',
    border: '1 solid #dee2e6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  summaryRowInfo: {
    backgroundColor: '#d1ecf1',
    borderBottomWidth: 1,
    borderBottomColor: '#bee5eb',
    borderBottomStyle: 'solid',
  },
  summaryRowSuccess: {
    backgroundColor: '#d4edda',
    borderBottomWidth: 1,
    borderBottomColor: '#c3e6cb',
    borderBottomStyle: 'solid',
  },
  summaryRowDanger: {
    backgroundColor: '#f8d7da',
    borderBottomWidth: 1,
    borderBottomColor: '#f5c6cb',
    borderBottomStyle: 'solid',
  },
  summaryRowWarning: {
    backgroundColor: '#fff3cd',
    fontWeight: 'bold',
    fontSize: 13,
  },
  summaryCell: {
    flex: 2,
    padding: 15,
    fontSize: 13,
    fontWeight: 'bold',
    justifyContent: 'center',
  },
  summaryCellNumber: {
    flex: 1,
    padding: 15,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    justifyContent: 'center',
  },
  
  // FIRMA
  signatureSection: {
    marginTop: 40,
    backgroundColor: '#ffffff',
    border: '1 solid #dee2e6',
    borderRadius: 6,
    padding: 20,
  },
  signatureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 20,
    borderBottom: '2 solid #0d6efd',
    paddingBottom: 8,
  },
  signatureRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  signatureColumn: {
    flex: 1,
    paddingRight: 20,
  },
  signatureBox: {
    height: 80,
    border: '1 solid #dee2e6',
    borderRadius: 4,
    marginTop: 10,
    backgroundColor: '#f8f9fa',
  },
  noteBox: {
    border: '1 solid #dee2e6',
    borderRadius: 4,
    minHeight: 60,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  signatureName: {
    textAlign: 'center',
    fontSize: 10,
    color: '#6c757d',
    marginTop: 5,
  },
  digitalSignatureContainer: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    border: '1 solid #dee2e6',
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  digitalSignature: {
    maxHeight: 60,
    maxWidth: 200,
    objectFit: 'contain',
    alignSelf: 'center',
    marginBottom: 5,
  },
  digitalSignatureInfo: {
    alignItems: 'center',
  },
  digitalSignatureText: {
    fontSize: 8,
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 2,
  },
  
  // BADGE E ELEMENTI DECORATIVI
  badge: {
    backgroundColor: '#198754',
    color: '#ffffff',
    padding: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
  },
  
  // TABELLA DATI PERSONALI
  dataTable: {
    width: '100%',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    borderBottomStyle: 'solid',
  },
  dataLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#495057',
  },
  dataValue: {
    flex: 2,
    fontSize: 10,
    color: '#212529',
  },
});

const RendicontoPDF = ({ rendiconto, amministratore }) => {
  // Funzioni di utilità
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '€ 0,00';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('it-IT');
  };

  const formatAddress = (indirizzo) => {
    if (!indirizzo) return 'Non specificato';
    const parts = [];
    if (indirizzo.via) parts.push(indirizzo.via);
    if (indirizzo.cap && indirizzo.citta) {
      parts.push(`${indirizzo.cap} ${indirizzo.citta}`);
    } else if (indirizzo.citta) {
      parts.push(indirizzo.citta);
    }
    if (indirizzo.provincia) parts.push(`(${indirizzo.provincia})`);
    return parts.join(', ') || 'Non specificato';
  };

  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.valore || item.importo || 0), 0);
  };

  const { datiGenerali, contoEconomico, firma } = rendiconto;
  
  // Dati dal beneficiario popolato
  const beneficiario = rendiconto.beneficiarioId;
  const condizioniPersonali = beneficiario?.condizioniPersonali;
  const situazionePatrimoniale = beneficiario?.situazionePatrimoniale;

  // Raggruppa le voci per categoria per il PDF (senza descrizioni)
  const entrateRaggruppate = raggruppaPerCategoriaPDF(contoEconomico?.entrate || []);
  const usciteRaggruppate = raggruppaPerCategoriaPDF(contoEconomico?.uscite || []);

  // Calcoli totali
  const totalePatrimonio = 
    calculateTotal(situazionePatrimoniale?.beniImmobili) +
    calculateTotal(situazionePatrimoniale?.beniMobili) +
    calculateTotal(situazionePatrimoniale?.titoliConti);
  
  const totaleEntrate = calculateTotal(entrateRaggruppate);
  const totaleUscite = calculateTotal(usciteRaggruppate);
  const saldo = totaleEntrate - totaleUscite;

  return (
    <Document>
      {/* PAGINA 1: DATI GENERALI E CONDIZIONI PERSONALI */}
      <Page size="A4" style={styles.page}>
        
        {/* INTESTAZIONE MODERNA */}
        <View style={styles.header}>
          <Text style={styles.title}>MODELLO DI RENDICONTO</Text>
          <View style={styles.subtitle}>
            <Text>
              Amministrazione di sostegno/tutela: R.G. n. {datiGenerali?.rg_numero || '1/2025'}
            </Text>
            <Text style={styles.period}>
              Periodo: {datiGenerali?.dataInizio && datiGenerali?.dataFine ? 
                `${formatDate(datiGenerali.dataInizio)} - ${formatDate(datiGenerali.dataFine)}` : 
                `Anno ${datiGenerali?.anno || '2025'}`
              }
            </Text>
          </View>
        </View>

        {/* SEZIONE DATI GENERALI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATI GENERALI</Text>
          
          <View style={styles.row}>
            {/* Beneficiario */}
            <View style={styles.column}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Beneficiario/Interdetto</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.dataTable}>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Nome:</Text>
                      <Text style={styles.dataValue}>{beneficiario?.nome || 'Non specificato'}</Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Cognome:</Text>
                      <Text style={styles.dataValue}>{beneficiario?.cognome || 'Non specificato'}</Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Codice Fiscale:</Text>
                      <Text style={styles.dataValue}>{beneficiario?.codiceFiscale || 'Non specificato'}</Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Data di Nascita:</Text>
                      <Text style={styles.dataValue}>{formatDate(beneficiario?.dataNascita) || 'Non specificato'}</Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Luogo di Nascita:</Text>
                      <Text style={styles.dataValue}>{beneficiario?.luogoNascita || 'Non specificato'}</Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Indirizzo:</Text>
                      <Text style={styles.dataValue}>{formatAddress(beneficiario?.indirizzo)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Amministratore */}
            <View style={styles.columnLast}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Amministratore di Sostegno</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.dataTable}>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Nome:</Text>
                      <Text style={styles.dataValue}>{amministratore?.nome || 'Non specificato'}</Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Cognome:</Text>
                      <Text style={styles.dataValue}>{amministratore?.cognome || 'Non specificato'}</Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Codice Fiscale:</Text>
                      <Text style={styles.dataValue}>{amministratore?.codiceFiscale || 'Non specificato'}</Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Email:</Text>
                      <Text style={styles.dataValue}>{amministratore?.email || 'Non specificato'}</Text>
                    </View>
                    {amministratore?.professione && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Professione:</Text>
                        <Text style={styles.dataValue}>{amministratore.professione}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* CONDIZIONI PERSONALI */}
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 10 }]}>CONDIZIONI PERSONALI DEL BENEFICIARIO</Text>
            <View style={styles.conditionsCard}>
              {condizioniPersonali ? (
                <Text style={styles.text}>{condizioniPersonali}</Text>
              ) : (
                <Text style={styles.textMuted}>Nessuna informazione inserita</Text>
              )}
            </View>
          </View>
        </View>

      </Page>

      {/* PAGINA 2: BENI IMMOBILI */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SITUAZIONE PATRIMONIALE - BENI IMMOBILI</Text>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Descrizione</Text>
              <Text style={styles.tableCellLast}>Valore</Text>
            </View>
            
            {situazionePatrimoniale?.beniImmobili?.length > 0 ? (
              situazionePatrimoniale.beniImmobili.map((bene, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowStriped]}>
                  <Text style={styles.tableCell}>{bene.descrizione}</Text>
                  <Text style={styles.tableCellLast}>{formatCurrency(bene.valore)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { textAlign: 'center', fontStyle: 'italic', color: '#6c757d' }]}>
                  Nessun bene immobile inserito
                </Text>
                <Text style={styles.tableCellLast}>€ 0,00</Text>
              </View>
            )}
            
            {/* Righe vuote per completare la pagina */}
            {Array.from({ length: Math.max(0, 15 - (situazionePatrimoniale?.beniImmobili?.length || 0)) }).map((_, index) => (
              <View key={`empty-${index}`} style={[styles.tableRow, { minHeight: 30 }, index % 2 === 1 && styles.tableRowStriped]}>
                <Text style={styles.tableCell}> </Text>
                <Text style={styles.tableCellLast}> </Text>
              </View>
            ))}
            
            <View style={[styles.tableRow, styles.tableFooter]}>
              <Text style={styles.tableCell}>TOTALE BENI IMMOBILI</Text>
              <Text style={styles.tableCellLast}>
                {formatCurrency(calculateTotal(situazionePatrimoniale?.beniImmobili))}
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* PAGINA 3: BENI MOBILI */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SITUAZIONE PATRIMONIALE - BENI MOBILI</Text>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Descrizione</Text>
              <Text style={styles.tableCellLast}>Valore</Text>
            </View>
            
            {situazionePatrimoniale?.beniMobili?.length > 0 ? (
              situazionePatrimoniale.beniMobili.map((bene, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowStriped]}>
                  <Text style={styles.tableCell}>{bene.descrizione}</Text>
                  <Text style={styles.tableCellLast}>{formatCurrency(bene.valore)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { textAlign: 'center', fontStyle: 'italic', color: '#6c757d' }]}>
                  Nessun bene mobile inserito
                </Text>
                <Text style={styles.tableCellLast}>€ 0,00</Text>
              </View>
            )}
            
            {/* Righe vuote per completare la pagina */}
            {Array.from({ length: Math.max(0, 15 - (situazionePatrimoniale?.beniMobili?.length || 0)) }).map((_, index) => (
              <View key={`empty-${index}`} style={[styles.tableRow, { minHeight: 30 }, index % 2 === 1 && styles.tableRowStriped]}>
                <Text style={styles.tableCell}> </Text>
                <Text style={styles.tableCellLast}> </Text>
              </View>
            ))}
            
            <View style={[styles.tableRow, styles.tableFooter]}>
              <Text style={styles.tableCell}>TOTALE BENI MOBILI</Text>
              <Text style={styles.tableCellLast}>
                {formatCurrency(calculateTotal(situazionePatrimoniale?.beniMobili))}
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* PAGINA 4: TITOLI, FONDI E CONTI */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SITUAZIONE PATRIMONIALE - TITOLI, FONDI E CONTI CORRENTI</Text>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Descrizione</Text>
              <Text style={styles.tableCellLast}>Valore</Text>
            </View>
            
            {situazionePatrimoniale?.titoliConti?.length > 0 ? (
              situazionePatrimoniale.titoliConti.map((bene, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowStriped]}>
                  <Text style={styles.tableCell}>{bene.descrizione}</Text>
                  <Text style={styles.tableCellLast}>{formatCurrency(bene.valore)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { textAlign: 'center', fontStyle: 'italic', color: '#6c757d' }]}>
                  Nessun titolo o conto inserito
                </Text>
                <Text style={styles.tableCellLast}>€ 0,00</Text>
              </View>
            )}
            
            {/* Righe vuote per completare la pagina */}
            {Array.from({ length: Math.max(0, 15 - (situazionePatrimoniale?.titoliConti?.length || 0)) }).map((_, index) => (
              <View key={`empty-${index}`} style={[styles.tableRow, { minHeight: 30 }, index % 2 === 1 && styles.tableRowStriped]}>
                <Text style={styles.tableCell}> </Text>
                <Text style={styles.tableCellLast}> </Text>
              </View>
            ))}
            
            <View style={[styles.tableRow, styles.tableFooter]}>
              <Text style={styles.tableCell}>TOTALE TITOLI E CONTI</Text>
              <Text style={styles.tableCellLast}>
                {formatCurrency(calculateTotal(situazionePatrimoniale?.titoliConti))}
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* PAGINA 5: ENTRATE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTO ECONOMICO - ENTRATE</Text>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderSuccess]}>
              <Text style={styles.tableCell}>Categoria</Text>
              <Text style={styles.tableCellLast}>Importo</Text>
            </View>
            
            {entrateRaggruppate.length > 0 ? (
              entrateRaggruppate.map((entrata, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowStriped]}>
                  <Text style={styles.tableCell}>
                    {entrata.categoria}
                    {entrata.numeroVoci > 1 && (
                      <Text style={styles.textMuted}> ({entrata.numeroVoci} voci)</Text>
                    )}
                  </Text>
                  <Text style={[styles.tableCellLast, styles.textSuccess]}>
                    {formatCurrency(entrata.importo)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { textAlign: 'center', fontStyle: 'italic', color: '#6c757d' }]}>
                  Nessuna entrata inserita
                </Text>
                <Text style={styles.tableCellLast}>€ 0,00</Text>
              </View>
            )}
            
            {/* Righe vuote per completare la pagina */}
            {Array.from({ length: Math.max(0, 15 - entrateRaggruppate.length) }).map((_, index) => (
              <View key={`empty-${index}`} style={[styles.tableRow, { minHeight: 30 }, index % 2 === 1 && styles.tableRowStriped]}>
                <Text style={styles.tableCell}> </Text>
                <Text style={styles.tableCellLast}> </Text>
              </View>
            ))}
            
            <View style={[styles.tableRow, styles.tableFooter]}>
              <Text style={styles.tableCell}>TOTALE ENTRATE</Text>
              <Text style={styles.tableCellLast}>
                {formatCurrency(totaleEntrate)}
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* PAGINA 6: USCITE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTO ECONOMICO - USCITE</Text>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderDanger]}>
              <Text style={styles.tableCell}>Categoria</Text>
              <Text style={styles.tableCellLast}>Importo</Text>
            </View>
            
            {usciteRaggruppate.length > 0 ? (
              usciteRaggruppate.map((uscita, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowStriped]}>
                  <Text style={styles.tableCell}>
                    {uscita.categoria}
                    {uscita.numeroVoci > 1 && (
                      <Text style={styles.textMuted}> ({uscita.numeroVoci} voci)</Text>
                    )}
                  </Text>
                  <Text style={[styles.tableCellLast, styles.textDanger]}>
                    {formatCurrency(uscita.importo)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { textAlign: 'center', fontStyle: 'italic', color: '#6c757d' }]}>
                  Nessuna uscita inserita
                </Text>
                <Text style={styles.tableCellLast}>€ 0,00</Text>
              </View>
            )}
            
            {/* Righe vuote per completare la pagina */}
            {Array.from({ length: Math.max(0, 15 - usciteRaggruppate.length) }).map((_, index) => (
              <View key={`empty-${index}`} style={[styles.tableRow, { minHeight: 30 }, index % 2 === 1 && styles.tableRowStriped]}>
                <Text style={styles.tableCell}> </Text>
                <Text style={styles.tableCellLast}> </Text>
              </View>
            ))}
            
            <View style={[styles.tableRow, styles.tableFooter]}>
              <Text style={styles.tableCell}>TOTALE USCITE</Text>
              <Text style={styles.tableCellLast}>
                {formatCurrency(totaleUscite)}
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* PAGINA 7: SITUAZIONE COMPLESSIVA E FIRMA */}
      <Page size="A4" style={styles.page}>
        
        {/* RIEPILOGO GENERALE */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>SITUAZIONE COMPLESSIVA</Text>
          
          <View style={styles.summaryTable}>
            <View style={[styles.tableRow, styles.summaryRowInfo]}>
              <Text style={styles.summaryCell}>VALORE TOTALE DEL PATRIMONIO</Text>
              <Text style={styles.summaryCellNumber}>
                {formatCurrency(totalePatrimonio)}
              </Text>
            </View>
            <View style={[styles.tableRow, styles.summaryRowSuccess]}>
              <Text style={styles.summaryCell}>TOTALE ENTRATE</Text>
              <Text style={[styles.summaryCellNumber, styles.textSuccess]}>
                {formatCurrency(totaleEntrate)}
              </Text>
            </View>
            <View style={[styles.tableRow, styles.summaryRowDanger]}>
              <Text style={styles.summaryCell}>TOTALE USCITE</Text>
              <Text style={[styles.summaryCellNumber, styles.textDanger]}>
                {formatCurrency(totaleUscite)}
              </Text>
            </View>
            <View style={[styles.tableRow, styles.summaryRowWarning]}>
              <Text style={styles.summaryCell}>SALDO (Entrate - Uscite)</Text>
              <Text style={[styles.summaryCellNumber, saldo >= 0 ? styles.textSuccess : styles.textDanger]}>
                {formatCurrency(saldo)}
              </Text>
            </View>
          </View>
        </View>

        {/* NOTE AGGIUNTIVE - SPOSTATE SOPRA LA FIRMA */}
        {firma?.noteAggiuntive && (
          <View style={{ marginTop: 30, marginBottom: 20 }}>
            <Text style={styles.textBold}>Note aggiuntive:</Text>
            <View style={styles.noteBox}>
              <Text style={styles.text}>
                {firma.noteAggiuntive}
              </Text>
            </View>
          </View>
        )}

        {/* SEZIONE FIRMA */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>FIRMA</Text>
          
          <View style={styles.signatureRow}>
            <View style={styles.signatureColumn}>
              <Text style={styles.textBold}>Luogo:</Text>
              <Text style={styles.text}>{firma?.luogo || '_'.repeat(30)}</Text>
            </View>
            <View style={styles.signatureColumn}>
              <Text style={styles.textBold}>Data:</Text>
              <Text style={styles.text}>{formatDate(firma?.data) || '_'.repeat(20)}</Text>
            </View>
          </View>

          {/* Firma */}
          <View>
            <Text style={styles.textBold}>Firma dell'Amministratore di Sostegno:</Text>
            
            {firma?.firmaDigitale?.immagine ? (
              // Firma digitale presente
              <View style={styles.digitalSignatureContainer}>
                <Image
                  src={firma.firmaDigitale.immagine}
                  style={styles.digitalSignature}
                />
              </View>
            ) : (
              // Spazio per firma manuale
              <View style={styles.signatureBox}></View>
            )}
            
            <Text style={styles.signatureName}>
              {amministratore?.nome} {amministratore?.cognome}
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default RendicontoPDF;