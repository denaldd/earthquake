import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Features from '../Features'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export default function Routing() {

  const classes = useStyles();


  return (
    <Container fixed>
    <div className={classes.root}>
    <br></br>
    <Router>
      <Grid container spacing={3}>
        <Grid item xs>
          <Paper className={classes.paper}>
            <Link to="/PastHour">Past Hour</Link>
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper className={classes.paper}>
            <Link to="/PastDay">Past Day</Link>
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper className={classes.paper}>
            <Link to="/Past7Days">Past 7 Days</Link>
          </Paper>
        </Grid>
      </Grid>
      <Switch>
          <Route path="/PastHour">
            <PastHour />
          </Route>
          <Route path="/PastDay">
            <PastDay />
          </Route>
          <Route path="/Past7Days">
            <Past7Days />
          </Route>
        </Switch>
      </Router>
    </div>
    </Container>
  );
}

function PastHour() {
  return <div><Features param={'all_hour'} /></div>;
}

function PastDay() {
  return <div><Features param={'all_day'} /></div>;
}

function Past7Days() {
  return <div><Features param={'all_week'} /></div>;
}