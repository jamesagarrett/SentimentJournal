import React, { useState } from "react";
import { Button, TextareaAutosize } from "@material-ui/core";
import axios from "axios";
import { formatDateObj } from "./util";
import { useAuth } from "../provider/AuthProvider";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";

import { getSpark, sparkMessages } from "./SparkMessages";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function EntrySubmitter(props) {
  // Component State
  const [value, setValue] = useState("");
  const [open, setOpen] = React.useState(false);
  const { inputs } = useAuth();

  const onChangeEvent = (event) => {
    setValue(event.target.value);
  };

  // Alert Dialog functions
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  function doSpark() {
    const currentDate = new Date();
    const threshold = -0.5;
    const days = 5;

    // Get entries from range of days[today-days, today]
    const end_date = formatDateObj(currentDate);
    const beg_date = formatDateObj(
      new Date(currentDate.setDate(currentDate.getDate() - days))
    );

    axios({
      method: "GET",
      url: "http://0.0.0.0:8081/v0/journal_entries",
      params: { startDate: beg_date, endDate: end_date, userId: inputs.uid },
    }).then((response) => {
      console.log("Spark Entries: ");
      console.log(response.data);

      // Calculate avg score of range of days
      let totalScore = 0.0;
      for (let entry in response.data) {
        totalScore += response.data[entry]["score"];
      }

      let avgScore = totalScore / Object.keys(response.data).length;

      if (avgScore < threshold) {
        handleClickOpen();
      }
    });
  }

  function submitEntry(value) {
    const currentDate = new Date();

    // Send PUT request to the backend
    axios({
      method: "PUT",
      url: "http://0.0.0.0:8081/v0/journal_entries",
      data: {
        date: formatDateObj(currentDate),
        userId: inputs.uid,
        content: value,
      },
    }).then(() => {
      doSpark();
    });
  }

  return (
    <div>
      <TextareaAutosize
        rowsMin={5}
        cols={60}
        placeholder="Insert Journal entry here"
        onChange={onChangeEvent}
        defaultValue={value}
      />

      <Button color="primary" onClick={() => submitEntry(value)}>
        Submit
      </Button>

      <div>
        <Dialog
          open={open}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            {"Looks like you need a spark?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {getSpark(
                Math.floor(Math.random() * sparkMessages.length),
                sparkMessages
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Thanks!
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default EntrySubmitter;
