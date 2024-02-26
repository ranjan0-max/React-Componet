import PropTypes from 'prop-types';
import * as React from 'react';
import { useState, useContext } from 'react';
import { CSVExport } from '../../forms/tables/TableExports';
import { SiteValueContext } from 'contexts/SiteContext';
import useAuth from 'hooks/useAuth';
import { IconStatusChange, IconDeviceFloppy } from '@tabler/icons';
// material-ui
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {
    Box,
    CardContent,
    Checkbox,
    Grid,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Toolbar,
    Tooltip,
    Typography,
    Button,
    Stack,
    Dialog,
    Menu,
    MenuItem
} from '@mui/material';

import { visuallyHidden } from '@mui/utils';

// project imports
import Chip from 'ui-component/extended/Chip';
import MainCard from 'ui-component/cards/MainCard';
import formatDate from 'utils/dateFormat';
import { useSnackbars } from '../../../Snackbars/showSnackbars';
import AddIcon from '@mui/icons-material/AddTwoTone';
// assets
import DeleteIcon from '@mui/icons-material/Delete';

import SearchIcon from '@mui/icons-material/Search';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import { useLocation, useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';

// Api
import { getExportJobBySite, createExportJob, updateExportJob, updateTheStatusOfExportJob, cancelJob } from 'api/job/jobApi';
import { getLoadListByNumber } from 'api/loadList/loadListApi';
import { getMileStoneForStatusChange } from 'api/mileStone/mileStoneApi';
import { getBookingPacketDetails } from 'api/bookingItems/bookingItemsApi';

// form
import ExportJobForm from './ExportJobForm';
import StatusChangeModel from './StatusChangeModel';
import JobLogModel from './JobLogModel';

// constant
import { ERROR, BLANK } from 'utils/constant';

const headerForCsv = [
    {
        label: 'Booking Number',
        key: '_id'
    },
    {
        label: 'Packet Count',
        key: 'totalPkt'
    },
    {
        label: 'AWB Number',
        key: 'awbNumber'
    },
    {
        label: 'Customer',
        key: 'customerName'
    },
    {
        label: 'Consignee',
        key: 'consigneeName'
    },
    {
        label: 'Shipper',
        key: 'shipperName'
    }
];

// table sort
function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

const getComparator = (order, orderBy) =>
    order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

// table header options
const headCells = [
    {
        id: 'jobNumber',
        numeric: true,
        label: 'Job Number',
        align: 'center'
    },
    {
        id: 'loadListNumber',
        numeric: true,
        label: 'Load List Number',
        align: 'center'
    },
    {
        id: 'origin',
        numeric: true,
        label: 'Origin',
        align: 'center'
    },

    {
        id: 'destination',
        numeric: true,
        label: 'Destination',
        align: 'center'
    },
    {
        id: 'status',
        numeric: true,
        label: 'Status',
        align: 'center'
    },
    {
        id: 'createdAt',
        numeric: true,
        label: 'Created At',
        align: 'center'
    }
];

// ==============================|| TABLE HEADER ||============================== //

function EnhancedTableHead({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, selected }) {
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {numSelected > 0 && (
                    <TableCell padding="none" colSpan={6}>
                        <EnhancedTableToolbar numSelected={selected.length} />
                    </TableCell>
                )}
                {numSelected <= 0 &&
                    headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            align={headCell.align}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </Box>
                                ) : null}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                {numSelected <= 0 && (
                    <TableCell sortDirection={false} align="center" sx={{ pr: 3 }}>
                        Action
                    </TableCell>
                )}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    selected: PropTypes.array,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired
};

// ==============================|| TABLE HEADER TOOLBAR ||============================== //

const EnhancedTableToolbar = ({ numSelected }) => (
    <Toolbar
        sx={{
            p: 0,
            pl: 1,
            pr: 1,
            ...(numSelected > 0 && {
                color: (theme) => theme.palette.secondary.main
            })
        }}
    >
        {numSelected > 0 ? (
            <Typography color="inherit" variant="h4">
                {numSelected} Selected
            </Typography>
        ) : (
            <Typography variant="h6" id="tableTitle">
                Nutrition
            </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {numSelected > 0 && (
            <Tooltip title="Delete">
                <IconButton size="large">
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        )}
    </Toolbar>
);

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired
};

// ==============================|| Job LIST ||============================== //

const ExportJobList = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const { siteValue } = useContext(SiteValueContext);
    const snackbars = useSnackbars();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const loadListNumber = queryParams.get('loadListNumber');
    const open = queryParams.get('open');

    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('calories');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [search, setSearch] = React.useState('');
    const [rows, setRows] = React.useState([]);
    const [showJobForm, setShowJobForm] = useState(false);
    const [jobDetail, setJobDetail] = useState({});
    const [jobEvent, setJobEvent] = useState();
    const [showStatusChangeModel, setShowStatusChangeModel] = useState(false);
    const [originalData, setOriginalData] = useState([]);
    const [loadListData, setLoadListData] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [fetchingData, setFetchingData] = useState(false);
    const [showJobLogModel, setShowJobLogModel] = useState(false);
    const [jobNumber, setJobNumber] = useState('');
    const [listOfMileStone, setListOfMileStone] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const handleClick = (event, rowOfMenu) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(rowOfMenu);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    // --------------------------- fetch data from server -----------------------------

    const fetchJobs = async () => {
        try {
            const response = await getExportJobBySite(siteValue);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                setRows(response);
                setOriginalData(response);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchLoadListData = async () => {
        try {
            const response = await getLoadListByNumber(loadListNumber);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                setLoadListData(response[0]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchBookingDetails = async (loadListNumber) => {
        try {
            const response = await getBookingPacketDetails(loadListNumber);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                setReportData(response);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setFetchingData(false); // Set fetchingData to false when data fetching completes
        }
    };

    const fetchMileStoneForImport = async () => {
        try {
            const response = await getMileStoneForStatusChange({});
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                setListOfMileStone(response);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // ------------------------------------ end ----------------------------------------

    const onCancel = () => {
        setAnchorEl(null);
        setShowJobForm(false);
        setShowJobLogModel(false);
        setShowStatusChangeModel(false);
    };

    // ------------------------------------ search ----------------------------------------

    const handleSearch = (event) => {
        const newString = event?.target.value;
        setSearch(newString || '');

        if (newString) {
            const newRows = originalData.filter((row) => {
                let matches = true;

                const properties = [];
                let containsQuery = false;

                properties.forEach((property) => {
                    if (row[property].toString().toLowerCase().includes(newString.toString().toLowerCase())) {
                        containsQuery = true;
                    }
                });

                if (!containsQuery) {
                    matches = false;
                }
                return matches;
            });
            setRows(newRows);
        } else {
            setRows(originalData);
        }
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            if (selected.length > 0) {
                setSelected([]);
            } else {
                const newSelectedId = rows.map((n) => n.name);
                setSelected(newSelectedId);
            }
            return;
        }
        setSelected([]);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event?.target.value, 10));
        setPage(0);
    };

    const isSelected = (name) => selected.indexOf(name) !== -1;

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    // ------------------------------------ end ----------------------------------------

    // ------------------------------------ job operations ---------------------------------

    const handleEventCreate = async (data) => {
        try {
            const response = await createExportJob(data);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, 'success');
                onCancel();
                navigate('/exportJob');
            }
        } catch (error) {
            console.log(error);
        }
        fetchJobs();
    };

    const handleEventUpdate = async (data) => {
        const id = data.id;
        try {
            const response = await updateExportJob(id, data);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, 'success');
                onCancel();
            }
        } catch (error) {
            console.log(error);
        }
        fetchJobs();
    };

    const handleStatusChangeUpdate = async (jobNumber, data) => {
        try {
            const response = await updateTheStatusOfExportJob(jobNumber, data);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, 'success');
                onCancel();
                fetchJobs();
            }
        } catch (error) {
            console.log(error);
        }
    };

    // ------------------------------------ end ----------------------------------------

    // ------------------------------------ Cancel Job ----------------------------------------

    const handleCancelButton = async (jobNumberForCancel) => {
        try {
            const response = await cancelJob(jobNumberForCancel);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, 'success');
                onCancel();
                fetchJobs();
            }
        } catch (error) {
            console.log(error);
        }
    };

    // ------------------------------------ end ----------------------------------------

    const handlePreviewButton = (jobNumber) => {
        setJobNumber(jobNumber);
        setShowJobLogModel(true);
    };

    const handleExportReport = async (row) => {
        await fetchBookingDetails(row.loadListNumber);
    };

    const handleEdit = (row) => {
        setJobEvent(true);
        setJobDetail(row);
        setShowJobForm(true);
    };

    const handleStatusChange = (row) => {
        setJobDetail(row);
        setShowStatusChangeModel(true);
    };

    function getRowStatus(statusId) {
        const mileStone = listOfMileStone.filter((mileStone) => mileStone._id === statusId);
        return mileStone[0]?.name;
    }

    React.useEffect(() => {
        fetchJobs();
        fetchMileStoneForImport();
    }, []);

    React.useEffect(() => {
        fetchJobs();
        fetchMileStoneForImport();
    }, [siteValue]);

    React.useEffect(() => {
        if (open && loadListNumber) {
            fetchLoadListData();
        }
    }, [open]);

    React.useEffect(() => {
        if (open && loadListNumber && loadListData) {
            setShowJobForm(true);
        }
    }, [loadListData]);

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
            const csvLink = document.createElement('a');
            const csvContent = `data:text/csv;charset=utf-8,${csvData.join('\n')}`;
            csvLink.href = encodeURI(csvContent);
            csvLink.download = 'job.csv';
            csvLink.click();
        }
    }, [fetchingData, reportData]);

    React.useEffect(() => {
        if (location.pathname === '/exportJob') {
            setShowJobForm(false);
        }
    }, [location]);

    // eslint-disable-next-line

    if (showJobForm) {
        return (
            <ExportJobForm
                jobEvent={jobEvent}
                onCancel={onCancel}
                jobDetail={jobDetail}
                loadListData={loadListData}
                handleUpdate={handleEventUpdate}
                handleCreate={handleEventCreate}
            />
        );
    }
    return (
        <MainCard
            title={
                <Typography variant="h3" color="secondary">
                    Export Job List
                </Typography>
            }
            secondary={
                <Stack direction="row" spacing={2} alignItems="center">
                    {/* <Button color="secondary" variant="contained" onClick={handleAddClick}>
                    <AddIcon fontSize="small" /> Add 
                </Button> */}
                </Stack>
            }
        >
            <CardContent>
                <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                )
                            }}
                            onChange={handleSearch}
                            placeholder="Search Job"
                            value={search}
                            size="small"
                        />
                    </Grid>
                </Grid>
            </CardContent>
            {/* table */}
            <TableContainer sx={{ maxHeight: 700 }}>
                <TableContainer stickyHeader sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                    <Table>
                        <EnhancedTableHead
                            theme={theme}
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                            selected={selected}
                        />
                        <TableBody>
                            {rows.length === 0 ? ( // Check if there are no rows
                                <TableRow>
                                    <TableCell colSpan={12} align="center">
                                        <Typography variant="subtitle1">NO DATA AVAILABLE IN TABLE</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stableSort(rows, getComparator(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => {
                                        /** Make sure no display bugs if row isn't an OrderData object */
                                        if (typeof row === 'number') return null;
                                        const isItemSelected = isSelected(row?.name);

                                        return (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                aria-checked={isItemSelected}
                                                tabIndex={-1}
                                                key={index}
                                                selected={isItemSelected}
                                            >
                                                <TableCell align="center">
                                                    <Typography variant="subtitle1" color="secondary">
                                                        {row?.jobNumber}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">{row?.loadListNumber}</TableCell>

                                                <TableCell align="center">{row?.origin}</TableCell>
                                                <TableCell align="center">{row?.destination}</TableCell>
                                                <TableCell align="center">
                                                    {row.status && (
                                                        <Chip
                                                            label={row.status === 'JOB CREATED' ? row.status : getRowStatus(row.status)}
                                                            size="small"
                                                            chipcolor="default"
                                                            style={{
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">{formatDate(row?.created_at ?? '')}</TableCell>

                                                <TableCell align="center" sx={{ pr: 1 }}>
                                                    <Stack direction="row" spacing={1}>
                                                        <IconButton
                                                            color="secondary"
                                                            size="small"
                                                            aria-label="menu"
                                                            onClick={(event) => handleClick(event, row)}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            )}
                            {selectedRow && (
                                <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                                    <MenuItem onClick={() => handleEdit(selectedRow)}>
                                        <Tooltip title="Edit The Job">
                                            <IconButton color="secondary" size="small" aria-label="edit">
                                                <EditTwoToneIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleStatusChange(selectedRow)}>
                                        <Tooltip title="Status Change">
                                            <IconButton color="secondary" size="small" aria-label="edit">
                                                <IconStatusChange />
                                            </IconButton>
                                        </Tooltip>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleExportReport(selectedRow)} disabled={fetchingData}>
                                        <Tooltip title="Dowload Job Detail">
                                            <IconButton color="secondary" size="small" aria-label="edit">
                                                <IconDeviceFloppy />
                                            </IconButton>
                                        </Tooltip>
                                    </MenuItem>
                                    <MenuItem onClick={() => handlePreviewButton(selectedRow?.jobNumber)}>
                                        <Tooltip title="Logs">
                                            <IconButton color="secondary" size="small" aria-label="edit">
                                                <VisibilityTwoToneIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleCancelButton(selectedRow?.jobNumber)}>
                                        <Tooltip title="Cancel Job">
                                            <IconButton color="secondary" size="small" aria-label="edit">
                                                <HighlightOffIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </MenuItem>
                                </Menu>
                            )}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 53 * emptyRows
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TableContainer>
            {/* table pagination */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={rows?.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <Dialog maxWidth="md" onClose={onCancel} open={showStatusChangeModel} sx={{ '& .MuiDialog-paper': { p: 0 } }}>
                {showStatusChangeModel && (
                    <StatusChangeModel onCancel={onCancel} handleStatusChangeUpdate={handleStatusChangeUpdate} jobDetail={jobDetail} />
                )}
            </Dialog>
            <Dialog maxWidth="lg" onClose={onCancel} open={showJobLogModel} sx={{ '& .MuiDialog-paper': { p: 0 } }}>
                {showJobLogModel && <JobLogModel onCancel={onCancel} jobNumber={jobNumber} />}
            </Dialog>
        </MainCard>
    );
};

export default ExportJobList;
