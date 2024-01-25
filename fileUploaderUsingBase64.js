const convertBase64 = (file) =>
        new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = (error) => reject(error);
        });

const handleVatFileChange = async (event) => {
        const file = event.target.files[0];
        const fileInString = await convertBase64(file);
        formik.setFieldValue('vat_doc', fileInString);
        checkNewFile('trade');
    };
