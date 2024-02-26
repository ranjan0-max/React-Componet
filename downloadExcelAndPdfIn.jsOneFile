import JsPDF from 'jspdf';
import 'jspdf-autotable';

React.useEffect(() => {
        if (!fetchingData && reportData.length > 0) {
            const csvData = [];
            // Add headers
            const headerRow = headerForCsv.map((header) => header.label);
            csvData.push(headerRow.join(','));

            // Add data rows
            reportData.forEach((item) => {
                const dataRow = headerForCsv.map((header) => item[header.key]);
                csvData.push(dataRow.join(','));
            });

            // Convert CSV data to blob
            const csvContent = `${csvData.join('\n')}`;
            const csvBlob = new Blob([csvContent], { type: 'text/csv' });

            // Create download links
            const csvLink = document.createElement('a');
            csvLink.href = URL.createObjectURL(csvBlob);
            csvLink.download = 'loadList.csv';

            const headers = csvData[0].split(',');

            // Convert remaining lines into objects using headers
            const result = csvData.slice(1).map((line) => {
                const values = line.split(',');
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header.trim()] = values[index].trim();
                });
                return obj;
            });

            const pdf = new JsPDF();

            pdf.setProperties({
                title: 'Data PDF',
                author: 'Your Name'
            });

            // Add headers to the PDF
            const headersForPdf = Object.keys(result[0]);
            const rows = result.map((obj) => Object.values(obj));

            pdf.autoTable({
                head: [headersForPdf],
                body: rows,
                startY: 10 // Set the starting y-coordinate for the table
            });

            // Save or open the PDF
            pdf.save('loadList.pdf');
            csvLink.click();
        }
    }, [fetchingData, reportData]);
