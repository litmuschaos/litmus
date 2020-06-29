import Button from "@material-ui/core/Button";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { Center } from "../../containers/layouts/Center";
import { Loader } from "../Loader";
import { useStyles } from "./styles";
import ReliablityScore from "../../pages/ReliabilityScore";
import ButtonOutline from "../ButtonOutline";
import ButtonFilled from "../ButtonFilled";
function getSteps(): string[] {
	return [
		"Target Cluster",
		"Choose a workflow",
		"Tune workflow",
		"Reliability score",
		"Schedule",
	];
}

function getStepContent(stepIndex: number): React.ReactNode {
	switch (stepIndex) {
		case 0:
			return "Select campaign settings...";
		case 1:
			return <Loader />;
		case 2:
			return "Show something random";
		case 3:
			return <ReliablityScore />;
		default:
			return (
				<Center>
					<span style={{ height: "100px" }}>hello I'm centered</span>
				</Center>
			);
	}
}

export default function CustomStepper() {
	const classes = useStyles();
	const [activeStep, setActiveStep] = React.useState(0);
	const steps = getSteps();

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleReset = () => {
		setActiveStep(0);
	};

	return (
		<div className={classes.root}>
			<Stepper activeStep={activeStep} alternativeLabel>
				{steps.map((label) => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
			<div>
				{activeStep === steps.length ? (
					<div>
						<Typography className={classes.content}>
							All steps completed (display workflow completed
							modal here)
						</Typography>
						<Button onClick={handleReset}>Reset</Button>
					</div>
				) : (
					<div>
						<div className={classes.content}>
							{getStepContent(activeStep)}
						</div>

						{/* Control Buttons */}
						<div className={classes.buttonGroup}>
							<ButtonOutline
								isDisabled={activeStep === 0}
								handleClick={handleBack}
								value="Back"
							/>
							<ButtonFilled
								handleClick={handleNext}
								value={
									activeStep === steps.length - 1
										? "Finish"
										: "Next"
								}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
