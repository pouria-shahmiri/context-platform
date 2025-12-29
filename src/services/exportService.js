import * as XLSX from 'xlsx';

/**
 * Export pyramid data to Excel file
 * 
 * @param {Object} pyramid - The pyramid object containing title and blocks
 */
export const exportToExcel = (pyramid) => {
  if (!pyramid || !pyramid.blocks) {
    console.error("No pyramid data to export");
    return;
  }

  // 1. Prepare Data
  const blocksData = Object.values(pyramid.blocks).map(block => {
    // Helper to format ID to chess notation if needed, or keep raw
    // For export, raw ID (e.g., 0-0) or formatted (1-A) is fine. Let's use formatted for readability if we had the helper,
    // but here we'll stick to raw or simple conversion.
    const [u, v] = block.id.split('-').map(Number);
    const rank = u + 1;
    const file = String.fromCharCode(65 + v);
    const chessId = `${rank}-${file}`;

    // Determine type based on content
    let type = 'question'; // default
    if (block.answer && block.question) type = 'answer-question';
    else if (block.parentIds && block.parentIds.length > 1) type = 'combined';

    // Format parents/children lists
    const parents = block.parentIds ? block.parentIds.map(pid => {
        const [pu, pv] = pid.split('-').map(Number);
        return `${pu+1}-${String.fromCharCode(65+pv)}`;
    }).join(', ') : '';

    // Note: Children are not explicitly stored in block data usually in this app structure (stored as parentIds on children),
    // but if we wanted them, we'd need to compute them from the full block set.
    // For this implementation, we will compute children on the fly.
    const childrenIds = Object.values(pyramid.blocks)
        .filter(b => b.parentIds && b.parentIds.includes(block.id))
        .map(b => {
            const [cu, cv] = b.id.split('-').map(Number);
            return `${cu+1}-${String.fromCharCode(65+cv)}`;
        })
        .join(', ');

    return {
      "Block ID": chessId,
      "Position (Row, Col)": `${rank}, ${file}`, // or raw coordinates
      "Type": type,
      "Question": block.question || block.content || '',
      "Answer": block.answer || '',
      "Parent IDs": parents,
      "Child IDs": childrenIds
    };
  });

  // Sort data by Block ID (roughly topological/level based)
  blocksData.sort((a, b) => a["Block ID"].localeCompare(b["Block ID"], undefined, { numeric: true, sensitivity: 'base' }));

  // 2. Create Workbook and Worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(blocksData);

  // Add Metadata row at the top (Optional - simpler to just have headers, but requirement said include metadata)
  // modifying sheet to insert rows is tricky with json_to_sheet. 
  // Easier approach: Array of arrays
  
  const header = ["Block ID", "Position", "Type", "Question", "Answer", "Parent IDs", "Child IDs"];
  const rows = blocksData.map(b => [
    b["Block ID"], 
    b["Position (Row, Col)"], 
    b["Type"], 
    b["Question"], 
    b["Answer"], 
    b["Parent IDs"], 
    b["Child IDs"]
  ]);

  // Prepend metadata
  const dataWithMetadata = [
    [`Pyramid Title: ${pyramid.title}`],
    [`Context: ${pyramid.context || "N/A"}`],
    [], // Empty row
    header,
    ...rows
  ];

  const finalWorksheet = XLSX.utils.aoa_to_sheet(dataWithMetadata);

  // Append sheet
  XLSX.utils.book_append_sheet(workbook, finalWorksheet, "Pyramid Data");

  // 3. Generate and Download
  const filename = `${pyramid.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.xlsx`;
  XLSX.writeFile(workbook, filename);
};
