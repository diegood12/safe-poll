import { Alert } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    alert: {
        marginBottom: '30px',
        marginTop: '-20px',
    }
}));

export default function DisplayAlert(error) {
    const classes = useStyles();
    if (error instanceof Object) {
        return (
            Object.keys(error).map((key, i) => (
                <div key={i}>
                    <Alert className={classes.alert} severity="error">{key}: {error[key]}</Alert>
                </div>)
            ));
    } else {
        return null;
    }
}
