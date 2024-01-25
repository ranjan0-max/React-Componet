const creditLimitTableHeader = [{ site: BLANK, creditAmount: BLANK, creditDays: BLANK }];
// state variables
const [creditSiteToDelete, setCreditSiteToDelete] = useState(BLANK);
const [creditLimitTableDetail, setCreditLimitTableDetail] = useState(event ? [] : customerDetail?.creditLimitMapping);
const [showCreditLimitTable, setShowCreditLimitTable] = useState(
    // eslint-disable-next-line
    event ? null : customerDetail?.creditLimitMapping.length ? true : false
);
const [creditLimitTableRowDetail, setCreditLimitTableRowDetail] = useState(creditLimitTableHeader);
const [selectedCreditLimitRowIndex, setSelectedCreditLimitRowIndex] = useState(null);

// functions
const handleAddRowOfCreditLimitTable = async () => {
        if (creditLimitTableRowDetail[0].site) {
            if (selectedCreditLimitRowIndex !== null) {
                // update
                const updatedTableDetail = [...creditLimitTableDetail];
                const customTable = creditLimitTableDetail.filter((row) => row.site !== creditSiteToDelete);
                if (!checkSiteExistInTable(creditSiteToCheck, customTable)) {
                    updatedTableDetail[selectedCreditLimitRowIndex] = { ...creditLimitTableRowDetail[0] };
                    setCreditLimitTableDetail(updatedTableDetail);
                    setSelectedCreditLimitRowIndex(null);
                } else {
                    snackbars('Site Already Used', ERROR);
                    setSelectedCreditLimitRowIndex(null);
                }
            } else {
                // add
                // eslint-disable-next-line
                if (!checkSiteExistInTable(creditLimitTableRowDetail[0].site, creditLimitTableDetail)) {
                    setCreditLimitTableDetail((prevDetail) => [...prevDetail, creditLimitTableRowDetail[0]]);
                } else {
                    snackbars('Site Already Used', ERROR);
                }
            }
            setCreditLimitTableRowDetail(creditLimitTableHeader);
        }
    };

    const handleInputChangeOfCreditLimit = (e, index) => {
        const { name, value } = e.target;
        if (selectedCreditLimitRowIndex >= 0 && name === 'site') {
            setCreditSiteToCheck(value);
        }
        const updatedCreditLimitTableDetail = [...creditLimitTableRowDetail];
        updatedCreditLimitTableDetail[index] = { ...updatedCreditLimitTableDetail[index], [name]: value };
        const currentCreditLimitMappingDetail = updatedCreditLimitTableDetail[index];
        updatedCreditLimitTableDetail[index] = {
            ...currentCreditLimitMappingDetail
        };
        setCreditLimitTableRowDetail(updatedCreditLimitTableDetail);
    };

    const handleDeleteRowOfCreditMappingTable = (index) => {
        setCreditLimitTableDetail((prevDimensions) => prevDimensions.filter((_, i) => i !== index));
    };

    const handleEditRowOfCreditMappingTable = (index) => {
        const selectedRow = creditLimitTableDetail[index];
        fetchUserBySite(getIdBySiteName(selectedRow.site));
        setCreditSiteToDelete(selectedRow.site);
        setSelectedCreditLimitRowIndex(index);
        setCreditLimitTableRowDetail([
            {
                site: selectedRow.site,
                creditAmount: selectedRow.creditAmount,
                creditDays: selectedRow.creditDays
            }
        ]);
    };

// html
<>
    <Grid item xs={12}>
        <Grid item xs={12} />
        <Grid item xs={12} />
        <Typography variant="subtitle1" color="primary">
            <PersonIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} /> Credit Limit Mapping
        </Typography>
        <Divider sx={{ borderTopWidth: '1px', borderTopColor: 'secondary' }} />
    </Grid>
    <Grid item xs={12} />
    <Grid item xs={8}>
        <TableContainer>
            <Table
                style={{
                    border: '2px solid #795eaf',
                    borderRadius: '8px',
                    borderCollapse: 'inherit',
                    background: '#f8fafd'
                }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell style={{ borderBottom: '1px solid black' }}>Site</TableCell>
                        <TableCell style={{ borderBottom: '1px solid black' }}>Credit Amount</TableCell>
                        <TableCell style={{ borderBottom: '1px solid black' }}>Credit Days</TableCell>
                        <TableCell style={{ borderBottom: '1px solid black' }} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {creditLimitTableDetail.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell style={{ borderBottom: '1px solid black', maxWidth: '100px' }}>
                                {row.site}
                            </TableCell>
                            <TableCell style={{ borderBottom: '1px solid black', maxWidth: '100px' }}>
                                {row.creditAmount}
                            </TableCell>
                            <TableCell style={{ borderBottom: '1px solid black', maxWidth: '100px' }}>
                                {row.creditDays}
                            </TableCell>
                            <TableCell style={{ borderBottom: '1px solid black', display: 'flex' }}>
                                <Button
                                    color="error"
                                    onClick={() => handleDeleteRowOfCreditMappingTable(index)}
                                >
                                    <RemoveCircleIcon sx={{ fontSize: '1.3rem' }} />
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={() => handleEditRowOfCreditMappingTable(index)}
                                >
                                    <EditIcon sx={{ fontSize: '1.3rem' }} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {creditLimitTableRowDetail.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell style={{ borderBottom: '1px solid black' }}>
                                <select
                                    name="site"
                                    id="site"
                                    style={{ width: '100px', height: '23px' }}
                                    value={row.site || BLANK}
                                    onChange={(e) => {
                                        handleInputChangeOfCreditLimit(e, index);
                                    }}
                                >
                                    <option value="" hidden>
                                        {' '}
                                    </option>
                                    {allSiteList.map((option) => (
                                        <option key={option._id} value={option.name}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </TableCell>
                            <TableCell style={{ borderBottom: '1px solid black' }}>
                                <input
                                    name="creditAmount"
                                    id="creditAmount"
                                    type="number"
                                    style={{ width: '100px', height: '23px' }}
                                    value={row.creditAmount || BLANK}
                                    onChange={(e) => handleInputChangeOfCreditLimit(e, index)}
                                />
                            </TableCell>
                            <TableCell style={{ borderBottom: '1px solid black' }}>
                                <select
                                    name="creditDays"
                                    id="creditDays"
                                    style={{ width: '100px', height: '23px' }}
                                    value={row.creditDays || BLANK}
                                    onChange={(e) => handleInputChangeOfCreditLimit(e, index)}
                                >
                                    <option value="" hidden>
                                        {' '}
                                    </option>
                                    <option value="30 Days">30 Days</option>
                                    <option value="40 Days">40 Days</option>
                                    <option value="50 Days">50 Days</option>
                                    <option value="60 Days">60 Days</option>
                                </select>
                            </TableCell>
                            <TableCell style={{ borderBottom: '1px solid black' }}>
                                <Button onClick={handleAddRowOfCreditLimitTable} color="success">
                                    {selectedCreditLimitRowIndex !== null ? 'Update' : 'Add'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Grid>
</>
