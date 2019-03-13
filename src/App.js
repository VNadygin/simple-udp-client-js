import React, { useState } from "react";
import { Formik } from "formik";
import io from "socket.io-client";
import { withStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

const socket = io("http://localhost:5000");

const styles = theme => ({
  root: {
    flexGrow: 1,
    justifyContent: "center"
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
    paddingTop: theme.spacing.unit * 2
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  form: {
    maxWidth: 600,
    margin: "0 auto",
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 2
  },
  submitButton: {
    marginTop: theme.spacing.unit,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  responsesWrapper: {
    marginTop: theme.spacing.unit
  }
});

const App = props => {
  const { classes } = props;

  const [responses, setResponses] = useState([]);

  // const writeResponse = message => {

  //   const newData = [...responses, data];
  //   console.log(newData);
  //   setResponses(newData);
  // };

  socket.on("message", msg => {
    const data = {
      timestamp: new Date().toLocaleString(),
      message: msg
    };

    setResponses([...responses, data]);
  });

  const sendMessage = async values => {
    socket.emit("message", JSON.stringify(values));
  };

  return (
    <>
      <CssBaseline />
      <div className={classes.root}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              UDP Client
            </Typography>
          </Toolbar>
        </AppBar>
        <Paper className={classes.form} elevation={2}>
          <Formik
            initialValues={{ host: "localhost", port: "5001", message: "" }}
            onSubmit={async (values, { setSubmitting }) => {
              sendMessage(values);
              // writeResponse(response);
              setSubmitting(false);
            }}
          >
            {({ values, handleChange, handleSubmit, isSubmitting }) => (
              <form
                className={classes.container}
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
              >
                <TextField
                  name="host"
                  label="Receiver Host"
                  className={classes.textField}
                  margin="dense"
                  onChange={handleChange}
                  value={values.host}
                  variant="outlined"
                />
                <TextField
                  name="port"
                  label="Receiver Port"
                  className={classes.textField}
                  margin="dense"
                  onChange={handleChange}
                  value={values.port}
                  variant="outlined"
                />
                <TextField
                  name="message"
                  label="Message"
                  multiline
                  fullWidth
                  rows="4"
                  className={classes.textField}
                  margin="dense"
                  onChange={handleChange}
                  value={values.message}
                  variant="outlined"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSubmitting}
                  className={classes.submitButton}
                >
                  Send
                </Button>
              </form>
            )}
          </Formik>
          {responses.length > 0 && (
            <div className={classes.responsesWrapper}>
              <Typography variant="h6" color="inherit">
                Server Responses
              </Typography>
              <div>
                {responses.map((item, index) => (
                  <div key={index}>
                    <Typography>{item.timestamp}</Typography>
                    <Typography variant="body2">{item.message}</Typography>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Paper>
      </div>
    </>
  );
};

export default withStyles(styles)(App);
