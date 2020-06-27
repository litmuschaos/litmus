import React, { useState } from "react";
import { useStyles } from "./styles";
import { Typography } from "@material-ui/core";
import ButtonOutline from "../../components/ButtonOutline/index";
import CustomSlider from "../../components/CustomSlider/index";
import CustomResultModal from "../../components/CustomResultModal";

function ReliablityScore() {
	const [value, setValue] = useState<number | Array<number>>([0]);
	const [value1, setValue1] = useState<number | Array<number>>([0]);
	const [value2, setValue2] = useState<number | Array<number>>([0]);
	const [value3, setValue3] = useState<number | Array<number>>([0]);
	const handleChange = (event: any, newValue: number | number[]) => {
		setValue(newValue);
	};
	const handleChange1 = (event: any, newValue: number | number[]) => {
		setValue1(newValue);
	};
	const handleChange2 = (event: any, newValue: number | number[]) => {
		setValue2(newValue);
	};
	const handleChange3 = (event: any, newValue: number | number[]) => {
		setValue3(newValue);
	};

	const testValue = [value, value1, value2, value3];

	const classes = useStyles();
	const [open, setOpen] = React.useState(false);
	const handleModal = () => {
		setOpen(true);
	};
	return (
		<form className={classes.root}>
			<div className={classes.mainDiv}>
				<div>
					<Typography className={classes.headerText}>
						<strong>
							Adjust the weights of the experiments in the
							workflow
						</strong>
					</Typography>
					<Typography className={classes.description}>
						You have selected 12 tests in the “Kubernetes
						conformance test” workflow. Successful outcome of each
						test carries a certain weight. We have pre-selected
						weights for each test for you. However, you may review
						and modify the weigtage against. The weights are
						relative to each other.
					</Typography>
				</div>
				<hr style={{ marginTop: 60, marginBottom: 10 }} />
				<div style={{ display: "flex", flexDirection: "row" }}>
					<Typography className={classes.testHeading}>
						<strong>Kubernetes conformance test</strong>
					</Typography>
				</div>
				<div>
					<div>
						<CustomSlider
							value={typeof value === "number" ? value : 0}
							testName={"Node add test"}
							onChangeCommitted={handleChange}
						/>
					</div>
					<div>
						<CustomSlider
							value={typeof value1 === "number" ? value1 : 0}
							testName={"Config map multi volume test"}
							onChangeCommitted={handleChange1}
						/>
					</div>
					<div>
						<CustomSlider
							value={typeof value2 === "number" ? value2 : 0}
							testName={"Networking pod test"}
							onChangeCommitted={handleChange2}
						/>
					</div>
					<div>
						<CustomSlider
							value={typeof value3 === "number" ? value3 : 0}
							testName={"Proxy-service-test"}
							onChangeCommitted={handleChange3}
						/>
					</div>
				</div>
				<hr />
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						marginTop: 40,
						marginBottom: 30,
					}}
				>
					<div>
						<ButtonOutline
							isDisabled={false}
							handleClick={handleModal}
							value={"Run Test"}
							data-cy="testRunButton"
						/>
						{open === true ? (
							<CustomResultModal
								isOpen={() => setOpen(false)}
								testValue={testValue}
							/>
						) : (
							<></>
						)}
					</div>
					<div style={{ margin: "auto" }}>
						<Typography className={classes.testInfo}>
							Adjust the relative weight of each test. If you want
							to know the suggested reliability score, play with
							the checkboxes on the right.
						</Typography>
					</div>
				</div>
			</div>
		</form>
	);
}

export default ReliablityScore;
