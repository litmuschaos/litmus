import React, { useState } from "react";
import { useStyles } from "./styles";
import { Typography, Paper, TextField, Hidden } from "@material-ui/core";
import ButtonFilled from "../../components/ButtonFilled/index";
import ButtonOutline from "../../components/ButtonOutline/index";
import FormControl from "@material-ui/core/FormControl";
import CustomSlider from "../../components/CustomSlider/index";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import CheckIcon from "@material-ui/icons/Check";

function ReliablityScore() {
	const [value, setValue] = React.useState<number | Array<number>>([0]);
	const [value1, setValue1] = React.useState<number | Array<number>>([0]);
	const [value2, setValue2] = React.useState<number | Array<number>>([0]);
	const [value3, setValue3] = React.useState<number | Array<number>>([0]);
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

	const classes = useStyles();
	// getModalStyle is not a pure function, we roll the style only on the first render
	const [open, setOpen] = React.useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	function createData(
		name: string,
		result: JSX.Element,
		weight: number | number[],
		points: number
	) {
		return { name, result, weight, points };
	}
	const result = 9;
	const result1 = 6;
	const result2 = 7;
	const result3 = 8;
	const rows = [
		createData(
			"Node add test",
			<div>
				<CheckIcon style={{ color: "#109B67" }} />{" "}
				<Typography>Pass</Typography>
			</div>,
			value,
			result
		),
		createData(
			"Config map multi volume test",
			<div>
				<CheckIcon style={{ color: "#109B67" }} />{" "}
				<Typography>Pass</Typography>
			</div>,
			value1,
			result1
		),
		createData(
			"Networking pod test",
			<div>
				<CheckIcon style={{ color: "#109B67" }} />{" "}
				<Typography>Pass</Typography>
			</div>,
			value2,
			result2
		),
		createData(
			"Proxy-service-test",
			<div>
				<CheckIcon style={{ color: "#109B67" }} />{" "}
				<Typography>Pass</Typography>
			</div>,
			value3,
			result3
		),
	];

	return (
		<div className={classes.rootContainer}>
			<form className={classes.root}>
				<div style={{ paddingLeft: 30, paddingRight: 30 }}>
					<div>
						<Typography className={classes.heading}>
							<strong>
								Adjust the weights of the experiments in the
								workflow
							</strong>
						</Typography>
						<Typography className={classes.description}>
							You have selected 12 tests in the “Kubernetes
							conformance test” workflow. Successful outcome of
							each test carries a certain weight. We have
							pre-selected weights for each test for you. However,
							you may review and modify the weigtage against. The
							weights are relative to each other.
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
								isActive={true}
								handleClick={handleOpen}
								value={"Run Test"}
								data-cy="testRunButton"
							/>
							<Modal
								aria-labelledby="transition-modal-title"
								aria-describedby="transition-modal-description"
								className={classes.modal}
								open={open}
								onClose={handleClose}
								closeAfterTransition
								BackdropComponent={Backdrop}
								BackdropProps={{
									timeout: 500,
								}}
							>
								<Fade in={open}>
									<div className={classes.paper}>
										{/* <h2 id="transition-modal-title">Transition modal</h2>
										<p id="transition-modal-description">
											react-transition-group animates me.
										</p> */}
										<div
											style={{
												width: 800,
												marginTop: 60,
											}}
										>
											<Typography
												className={classes.headingModal}
											>
												<strong>
													Simulate the workflow run
													and see the suggested
													reliability score
												</strong>
											</Typography>
											<Typography
												className={classes.headingModal}
											>
												<strong>
													(worflow1 (K8S conformance
													test on Ignite cluster)
												</strong>
											</Typography>
										</div>
										<TableContainer>
											<Table
												className={classes.table}
												aria-label="simple table"
											>
												<TableHead>
													<TableRow>
														<TableCell
															className={
																classes.tableHeading
															}
														>
															Test Name
														</TableCell>
														<TableCell
															align="center"
															className={
																classes.tableHeading
															}
														>
															Test Result
														</TableCell>
														<TableCell
															align="center"
															className={
																classes.tableHeading
															}
														>
															Weight of test
														</TableCell>
														<TableCell
															align="center"
															className={
																classes.tableHeading
															}
														>
															Test Points
														</TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{rows.map((row) => (
														<TableRow
															key={row.name}
														>
															<TableCell
																component="th"
																scope="row"
																className={
																	classes.tableData
																}
															>
																{row.name}
															</TableCell>
															<TableCell
																align="center"
																className={
																	classes.testResult
																}
															>
																{row.result}
															</TableCell>
															<TableCell
																align="center"
																className={
																	classes.tableWeight
																}
															>
																{row.weight}
																&nbsp; points
															</TableCell>
															<TableCell
																align="center"
																className={
																	classes.tablePoints
																}
															>
																{row.points}
																&nbsp; points
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</TableContainer>
										<div
											style={{
												width: 600,
												marginTop: 40,
												marginLeft: 450,
											}}
										>
											<ButtonFilled
												handleClick={() => {
													console.log("Next");
												}}
												value={"Got it"}
												data-cy="nextButton"
											/>
										</div>
									</div>
								</Fade>
							</Modal>
						</div>
						<div style={{ margin: "auto" }}>
							<Typography className={classes.testInfo}>
								Adjust the relative weight of each test. If you
								want to know the suggested reliability score,
								play with the checkboxes on the right.
							</Typography>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}

export default ReliablityScore;
