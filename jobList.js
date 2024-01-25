import PropTypes from 'prop-types';
import * as React from 'react';
import { useState, useContext } from 'react';
import { CSVExport } from '../../forms/tables/TableExports';
import { SiteValueContext } from 'contexts/SiteContext';
import useAuth from 'hooks/useAuth';
// material-ui
import { useTheme } from '@mui/material/styles';
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
    Dialog
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
import { useLocation } from 'react-router-dom';

// Api
import { getJob, createJob, updateJob } from 'api/job/jobApi';
import { getLoadListByNumber } from 'api/loadList/loadListApi';

// form
import JobForm from './JobForm';

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

const JobList = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const { siteValue } = useContext(SiteValueContext);
    const snackbars = useSnackbars();
    const location = useLocation();
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
    const [showJobForm, setShowJobForm] = useState();
    const [jobDetail, setJobDetail] = useState({});
    const [leadFormEvent, setLeadFormEvent] = useState();
    const [showLeadPreview, setShowLeadPreview] = useState(false);
    const [originalData, setOriginalData] = useState([]);
    const [loadListData, setLoadListData] = useState([]);

    const fetchJobs = async () => {
        try {
            const response = await getJob(siteValue);
            if (typeof response === 'string') {
                snackbars(response, 'error');
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
                snackbars(response, 'error');
            } else {
                setLoadListData(response);
                console.log(response);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onCancel = () => {
        setShowJobForm(false);
        setShowLeadPreview(false);
    };

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

    const handleEventCreate = async (data) => {
        try {
            const response = await createJob(data);
            if (typeof response === 'string') {
                snackbars(response, 'error');
            } else {
                snackbars(response.data.message, 'success');
                onCancel();
            }
        } catch (error) {
            console.log(error);
        }
        fetchJobs();
    };

    const handleEventUpdate = async (data) => {
        const id = data.id;
        delete data.id;
        try {
            const response = await updateJob(id, data);
            if (typeof response === 'string') {
                snackbars(response, 'error');
            } else {
                snackbars(response.data.message, 'success');
                onCancel();
            }
        } catch (error) {
            console.log(error);
        }
        fetchJobs();
    };

    const handleEdit = (row) => {
        setLeadFormEvent(true);
        setJobDetail(row);
        setShowJobForm(true);
    };

    const handleLeadPreview = (row) => {
        setJobDetail(row);
        setShowLeadPreview(true);
    };

    const handleAddClick = () => {
        setLeadFormEvent(false);
        setShowJobForm(true);
    };

    React.useEffect(() => {
        fetchJobs();
    }, []);

    React.useEffect(() => {
        fetchJobs();
    }, [siteValue]);

    React.useEffect(() => {
        if (open && loadListNumber) {
            fetchLoadListData();
        }
    }, [open]);

    React.useEffect(() => {
        if (loadListData.length) {
            setShowJobForm(true);
        }
    }, [loadListData]);

    // React.useEffect(() => {
    //     if (location.pathname === '/sales/lead') {
    //         setShowJobForm(false);
    //         setShowLeadPreview(false);
    //     }
    // }, [location]);

    // eslint-disable-next-line

    if (showJobForm) {
        return <JobForm onCancel={onCancel} jobDetail={jobDetail} loadListData={loadListData} />;
    }
    return (
        <MainCard
            title={
                <Typography variant="h3" color="secondary">
                    Job List
                </Typography>
            }
            secondary={
                <Stack direction="row" spacing={2} alignItems="center">
                    <CSVExport data={rows} filename="job.csv" header={headCells} />

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
                            placeholder="Search Lead"
                            value={search}
                            size="small"
                        />
                    </Grid>
                </Grid>
            </CardContent>
            {/* table */}
            <TableContainer sx={{ maxHeight: 700 }}>
                <TableContainer stickyHeader sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
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
                    <Table>
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
                                        const labelId = `enhanced-table-checkbox-${index}`;

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

                                                <TableCell align="center">
                                                    <Typography variant="subtitle1">{row?.loadListNumber}</Typography>
                                                </TableCell>

                                                <TableCell align="center">{row?.origin}</TableCell>
                                                <TableCell align="center">{row?.destination}</TableCell>
                                                <TableCell align="center">{row?.status}</TableCell>
                                                <TableCell align="center">{formatDate(row?.created_at ?? '')}</TableCell>

                                                <TableCell align="center" sx={{ pr: 3 }}>
                                                    <IconButton color="secondary" size="large" aria-label="edit">
                                                        <EditTwoToneIcon sx={{ fontSize: '1.3rem' }} onClick={() => handleEdit(row)} />
                                                    </IconButton>
                                                    <IconButton
                                                        color="primary"
                                                        size="large"
                                                        aria-label="view"
                                                        onClick={() => handleLeadPreview(row)}
                                                    >
                                                        <VisibilityTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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
        </MainCard>
    );
};

export default JobList;
