/**
 * Raggruppa le voci economiche per categoria, sommando gli importi
 * @param {Array} voci - Array di voci economiche
 * @returns {Array} Array di voci raggruppate per categoria
 */
export const raggruppaPerCategoria = (voci) => {
  if (!voci || !Array.isArray(voci)) return [];

  // Raggruppa per categoria
  const raggruppate = voci.reduce((acc, voce) => {
    const categoria = voce.categoria || 'Altro';
    
    if (!acc[categoria]) {
      acc[categoria] = {
        categoria,
        importo: 0,
        descrizioni: [],
        numeroVoci: 0
      };
    }
    
    acc[categoria].importo += parseFloat(voce.importo) || 0;
    acc[categoria].numeroVoci += 1;
    
    // Aggiungi la descrizione se presente e non vuota
    if (voce.descrizione && voce.descrizione.trim()) {
      acc[categoria].descrizioni.push(voce.descrizione.trim());
    }
    
    return acc;
  }, {});

  // Converti in array e ordina per categoria
  return Object.values(raggruppate)
    .sort((a, b) => a.categoria.localeCompare(b.categoria))
    .map(gruppo => ({
      ...gruppo,
      // Crea una descrizione combinata per la visualizzazione dettagliata
      descrizioneCompleta: gruppo.descrizioni.length > 0 
        ? gruppo.descrizioni.join('; ')
        : `${gruppo.numeroVoci} voce${gruppo.numeroVoci > 1 ? '' : ''}`
    }));
};

/**
 * Raggruppa le voci economiche per categoria per il PDF (senza descrizioni)
 * @param {Array} voci - Array di voci economiche
 * @returns {Array} Array di voci raggruppate per categoria senza descrizioni
 */
export const raggruppaPerCategoriaPDF = (voci) => {
  if (!voci || !Array.isArray(voci)) return [];

  // Raggruppa per categoria
  const raggruppate = voci.reduce((acc, voce) => {
    const categoria = voce.categoria || 'Altro';
    
    if (!acc[categoria]) {
      acc[categoria] = {
        categoria,
        importo: 0,
        numeroVoci: 0
      };
    }
    
    acc[categoria].importo += parseFloat(voce.importo) || 0;
    acc[categoria].numeroVoci += 1;
    
    return acc;
  }, {});

  // Converti in array e ordina per categoria
  return Object.values(raggruppate)
    .sort((a, b) => a.categoria.localeCompare(b.categoria));
};

/**
 * Calcola il totale di un array di voci (anche raggruppate)
 * @param {Array} voci - Array di voci economiche
 * @returns {number} Totale degli importi
 */
export const calcolaTotale = (voci) => {
  if (!voci || !Array.isArray(voci)) return 0;
  return voci.reduce((total, voce) => total + (parseFloat(voce.importo) || 0), 0);
}; 