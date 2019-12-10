/ eslint-disable react-hooks/exhaustive - deps /
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    List,
    ListItem,
    ListItemText,
    Typography,
    Grid,
    Divider,
    CircularProgress,
    Paper
} from '@material-ui/core';
import InfiniteScroll from 'react-infinite-scroller';
import axios from 'axios';
import Loading from '../loading/Loading';
import { withNamespaces } from 'react-i18next';

import SearchFilter from './SearchFilter';
import SearchSurvey from './SearchSurveys';

import { AUTH_ERROR } from '../../store/actions/types';
import { useStyles } from './styles';
import { setAlert } from '../../store/actions/alert';

const ListView = ({ match, logoutUser, showAlert, t }) => {
    const [moduleName, setModuleName] = useState(match.params.moduleName);
    const [headerFields, setHeaderFields] = useState([]);
    const [columnsJson, setColumnsJson] = useState([]);
    const [headerFieldsForAPICall, setHeaderFieldsForAPICall] = useState([]);
    const [moduleFields, setModuleFields] = useState([]);
    const [filteredField, setFilteredField] = useState('');
    const [pageResults, setPageResults] = useState(10);
    const [allResultsLoaded, setAllResultsLoaded] = useState(true);
    const [loading, setLoading] = useState(true);
    const [zeroResults, setZeroResults] = useState(false);

    if (localStorage.sessionName && localStorage.user) {
        var sessionName = localStorage.getItem('sessionName');
        var user = JSON.parse(localStorage.getItem('user'));
        var useriloguar2 = user.contactid.split('x')[1];
    }

    const classes = useStyles();

    useEffect(() => {
        const { moduleName } = match.params;
        setModuleName(moduleName);

        // First call gets headers of the list item
        // Second call gets the values of this headers
        const fetchData = async dispatch => {
            await axios
                .get('/webservice.php?', {
                    params: {
                        module: moduleName,
                        operation: 'getfilterfields',
                        sessionName
                    }
                })
                .then(response => {
                    if (response.data.success === false) {
                        logoutUser();
                        showAlert(response.data.error.message);

                        throw new Error(response.data.error.message);
                    } else {
                        setHeaderFields(
                            response.data.result.fields
                                .map(field => `${field}`)
                                .join(',')
                                .split(',')
                        );

                        // Update headerFields with the format of the ListView API Call
                        setHeaderFieldsForAPICall(
                            response.data.result.fields.map(field => `"${field}"`).join(',')
                        );
                        return response.data.result.fields
                            .map(field => `"${field}"`)
                            .join(',');
                    }
                })
                .then(headerFields =>
                    axios.get('/webservice.php?', {
                        params: {
                            fields: `[${headerFields}]`,
                            filter: filteredField,
                            limit: 'limit 0,10',
                            module: moduleName,
                            operation: 'getCustomerTypes',
                            pickpay: user.patientid,
                            sessionName,
                            useriloguar: useriloguar2,
                            where: '-1'
                        }
                    })
                )
                .then(response => {
                    if (response.data.success === false) {
                        dispatch({
                            type: AUTH_ERROR
                        });
                        throw new Error(response.data.error.message);
                    } else {
                        if (response.data.result[moduleName].total === 0) {
                            setLoading(false);
                            setZeroResults(true);
                        } else if (response.data.result[moduleName].total < 10) {
                            setAllResultsLoaded(false);
                        }
                        setModuleFields(response.data.result[moduleName].record_set);
                        setColumnsJson(response.data.result[moduleName].columnsJson);
                        setLoading(false);
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        };
        fetchData();
        return () => {
            setLoading(true);
        };
    }, [filteredField]);

    // Get more list items starting with limit 10,10
    const fetchMoreListItems = dispatch => {
        const { moduleName } = match.params;
        setModuleName(moduleName);

        axios
            .get('/webservice.php?', {
                params: {
                    fields: `[${headerFieldsForAPICall}]`,
                    filter: `${filteredField}`,
                    limit: `limit ${pageResults},10`,
                    module: moduleName,
                    operation: 'getCustomerTypes',
                    pickpay: user.patientid,
                    sessionName,
                    useriloguar: useriloguar2,
                    where: '-1'
                }
            })
            .then(response => {
                if (response.data.success === false) {
                    dispatch({
                        type: AUTH_ERROR
                    });
                } else {
                    // if there is no more items to load, dont fetch more data
                    if (response.data.result[moduleName].record_set.length === 0) {
                        setAllResultsLoaded(false);
                    } else {
                        // update list items
                        response.data.result[moduleName].record_set.map((cases, i) =>
                            setModuleFields(prevState => [
                                ...prevState,
                                response.data.result[moduleName].record_set[i]
                            ])
                        );
                    }
                    setPageResults(pageResults => pageResults + 10);
                }
            });
    };

    // Update filteredField which will re-render component with the new results
    const updateFilteredField = value => {
        setLoading(true);
        setFilteredField(`{${value}}`);
    };

    const getLabel = name => {
        let el = columnsJson.filter(e => e.field === name)[0];

        if (!el) {
            return name;
        }

        return el.headerName;
    };

    return (
        <div>
            <div>
                {loading && <Loading />}
                <Grid
                    container
                    spacing={3}
                    direction="row"
                    className={classes.spacing}
                    style={{ padding: '15px' }}
                >
                    <Grid item xs={12} sm={6} md={6} lg={6} className={classes.grid}>
                        {loading ? (
                            <>
                                <Typography
                                    component="p"
                                    style={{ textAlign: 'center' }}
                                    variant="body2"
                                >
                                    Loading...
</Typography>
                            </>
                        ) : (
                                <>
                                    {moduleName === 'Cases' && (
                                        <Link to="/cases/create/" className={classes.link}>
                                            {t('Add Cases')}
                                        </Link>
                                    )}
                                    <Typography variant="h6" gutterBottom>
                                        {t(moduleName)} {t('List')}
                                    </Typography>
                                    <Divider />
                                    {moduleName == 'cbSurveyDone' ? (
                                        <SearchSurvey />
                                    ) : (
                                            <SearchFilter
                                                headerFields={headerFields}
                                                updateFilteredField={updateFilteredField}
                                            />
                                        )}

                                    {/ List items will be inside Infinity Scroll Component /}
                                    <InfiniteScroll
                                        pageStart={0}
                                        loadMore={fetchMoreListItems}
                                        hasMore={allResultsLoaded}
                                        loader={
                                            <>
                                                <CircularProgress className={classes.progress} />
                                            </>
                                        }
                                    >
                                        <Grid
                                            container
                                            spacing={3}
                                            className={classes.spacing}
                                            direction="row"
                                            style={{ paddingTop: 16 }}
                                        >
                                            {zeroResults ? (
                                                <div>There is no results...</div>
                                            ) : (
                                                    <List className={classes.root}>
                                                        {/ Loop though each list item and display its data /}
                                                        {moduleFields.map((field, fieldIndex) => (
                                                            <Paper className={classes.paper} elevation={5}>
                                                                <Link
                                                                    to={
                                                                        moduleName === 'cbSurveyDone'
                                                                            ? `/surveys/detail/${field.vintosurvey}/`
                                                                            : `/detail/${moduleName}/${field.id}/`
                                                                    }
                                                                >
                                                                    <ListItem
                                                                        alignItems="flex-start"
                                                                        key={fieldIndex}
                                                                    >
                                                                        <ListItemText
                                                                            secondary={
                                                                                <>
                                                                                    {/ TODO - Beautify the layout of each list item /}
                                                                                    {/ Loop through each headerField and get the value of it /}
                                                                                    {headerFields.map(header => {
                                                                                        let h = getLabel(header);
                                                                                        return (
                                                                                            <>
                                                                                                <div className={classes.rowSpace}>
                                                                                                    <b>
                                                                                                        {h !== 'Accounts'
                                                                                                            ? `${t(h)
                                                                                                                .charAt(0)
                                                                                                                .toUpperCase() +
                                                                                                            t(h).slice(1)}: `
                                                                                                            : `Accounts: `}
                                                                                                    </b>
                                                                                                    {field[header]}
                                                                                                </div>
                                                                                            </>
                                                                                        );
                                                                                    })}
                                                                                </>
                                                                            }
                                                                        />
                                                                    </ListItem>
                                                                </Link>
                                                            </Paper>
                                                        ))}
                                                    </List>
                                                )}
                                        </Grid>
                                    </InfiniteScroll>
                                </>
                            )}
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

function mapDispatchToProps(dispatch) {
    return {
        logoutUser: () => {
            dispatch({
                type: AUTH_ERROR
            });
        },
        showAlert: message => {
            dispatch(setAlert(message, 'error'));
        }
    };
}

export default withNamespaces()(
    connect(mapStateToProps, mapDispatchToProps)(ListView)
);