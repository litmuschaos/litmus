import { makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) => ({
    rootContainer: {
	width: "100%",
	height: "100%",
 	display: "flex",
	flexDirection: "column",
	background: 'rgba(255, 255, 255, 0.6)',
	paddingBottom: '10rem',
    },
    check:{
        marginLeft: 167,
        marginTop: 102,
        "&:hover": {
	shadow: "#5B44BA",
	},
     },
    heading:{
        marginLeft: 167,
        marginTop: 30,
        marginBottom: 30,
        textAlign: 'left',
        fontFamily: "Ubuntu",
        fontStyle: "normal",
        fontWeight: "bold",
        fontSize: 36,
        lineHeight: "130%",
        color: "#000000",
    },
    head2:{
        textAlign: 'left',
        marginLeft: 167,
        marginBottom: 10,
        fontFamily: "Ubuntu",
        fontStyle: "normal",
        fontWeight: "normal",
        color: '#000000',
    },
    head3:{
       marginLeft: 167,
       textAlign: 'left',
    },
    head4:{
        marginLeft: 210,
        textAlign: 'left',
        marginTop:40,
        fontFamily: "Ubuntu",
        fontStyle: "normal",
        fontWeight: "normal",
        fontSize: 12,
        lineHeight: '130.2%',
        color: '#000000',
    },
    radiobutton:{
        position: 'absolute',
        marginLeft: 167,
        textAlign:'left',
        marginTop: 30,
        marginRight:15,
    },
    button:{
        marginLeft: 167,
        textAlign: 'left',
        marginTop: 64,
    },
    or:{
        marginLeft: 347,
        marginTop: -25,
        textAlign:'left',
        fontFamily: "Ubuntu",
        fontStyle: "normal",
        fontWeight: "normal",
        fontSize: 14,
        lineHeight: '130.2%',
        color: '#7D7E8C',
    }
}));
