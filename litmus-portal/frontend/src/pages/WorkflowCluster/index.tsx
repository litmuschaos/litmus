import { Typography } from "@material-ui/core";
import * as React from "react";
import useStyles from "./styles";
import Radio from '@material-ui/core/Radio';
import Button from "@material-ui/core/Button";

{/* Check is image which is used as a sign on cluster page*/}

function Check(){
    const classes = useStyles();
    
    return <img src="icons/check.png" className={classes.check} alt="Check" />;
}

{/* This screen is starting page of workflow */}

function WorkflowCluster() {
	const classes = useStyles();
	return (
		<div className={classes.rootContainer}>
		{/* Arrow mark */}
			<div>
					<Check  />
			</ div>
			<div >
				<Typography className={classes.heading}>
					<strong> Choose the target Kubernetes cluster</ strong>
				</Typography>
				<Typography className={classes.head2}>
					You are creating a <strong> new chaos workflow.</ strong>
				</Typography>
				<Typography className={classes.head3}>
					Select a target Kubernetes cluster to run this workflow.
				</Typography>
				
				<div className={classes.radiobutton}>
					<Radio
						//checked={selectedValue === 'd'}
						//onChange={handleChange}
						data-cy="selectRadio"
						value="d"
						color="secondary"
						name="radio-button-demo"
						inputProps={{ 'aria-label': 'D' }}
					/>
						Ignite-cluster(where this Litmus portal is install and running)
			
				</ div>
					
			</ div>
          
		{/* Division is used for Ignite-cluster(where this Litmus portal is install and running) or alternative Install Litmus Agent to other Kubernetes cluster*/}
			<div>
				<div style={{
					marginLeft: 167,
					textAlign: 'left',
					marginTop: 67,
				}}>
				<Button
					variant="contained"
					color="secondary"
					data-cy="selectButton"
				>
				Select and continue
				</ Button>
				</div>
				<div className={classes.or}>
					or
				</div>
				<div style={{
					marginLeft: 372,
					marginTop: -25,
					textAlign: 'left',
				}}
				>
				<Button
					variant="contained"
					color="inherit"
					data-cy="selectLitmusKubernetes"
				>
				Install Litmus agents to other Kubernetes cluster
				</Button>
				</div>
			</div>
     	</div>
	);
}

export default WorkflowCluster;
