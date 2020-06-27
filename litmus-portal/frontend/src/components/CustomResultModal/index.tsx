import React, { useState } from "react";
import { useStyles } from "./styles";
import { Typography } from "@material-ui/core";
import ButtonFilled from "../../components/ButtonFilled/index";
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

interface customModalProps {
	isOpen: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	testValue: (number | number[])[];
}

export default function CustomResultModal(props: customModalProps) {
	const classes = useStyles();
	const { isOpen, testValue } = props;

	const rows = [
		createData(
			"Node add test",
			<div>
				<CheckIcon style={{ color: "#109B67" }} />{" "}
				<Typography>Pass</Typography>
			</div>,
			testValue[0],
			result
		),
		createData(
			"Config map multi volume test",
			<div>
				<CheckIcon style={{ color: "#109B67" }} />{" "}
				<Typography>Pass</Typography>
			</div>,
			testValue[1],
			result1
		),
		createData(
			"Networking pod test",
			<div>
				<CheckIcon style={{ color: "#109B67" }} />{" "}
				<Typography>Pass</Typography>
			</div>,
			testValue[2],
			result2
		),
		createData(
			"Proxy-service-test",
			<div>
				<CheckIcon style={{ color: "#109B67" }} />{" "}
				<Typography>Pass</Typography>
			</div>,
			testValue[3],
			result3
		),
	];

	return (
		<div>
			<Modal
				aria-labelledby="transition-modal-title"
				aria-describedby="transition-modal-description"
				className={classes.modal}
				open={true}
				onClose={isOpen}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={true}>
					<div className={classes.paper}>
						<div className={classes.tableHeader}>
							<Typography className={classes.headingModal}>
								<strong>
									Simulate the workflow run and see the
									suggested reliability score
								</strong>
							</Typography>
							<Typography className={classes.headingModal}>
								<strong>
									(worflow1 (K8S conformance test on Ignite
									cluster)
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
											className={classes.tableHeading}
										>
											Test Name
										</TableCell>
										<TableCell
											align="center"
											className={classes.tableHeading}
										>
											Test Result
										</TableCell>
										<TableCell
											align="center"
											className={classes.tableHeading}
										>
											Weight of test
										</TableCell>
										<TableCell
											align="center"
											className={classes.tableHeading}
										>
											Test Points
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rows.map((row) => (
										<TableRow key={row.name}>
											<TableCell
												component="th"
												scope="row"
												className={classes.tableData}
											>
												{row.name}
											</TableCell>
											<TableCell
												align="center"
												className={classes.testResult}
											>
												{row.result}
											</TableCell>
											<TableCell
												align="center"
												className={classes.tableWeight}
											>
												{row.weight}
												&nbsp; points
											</TableCell>
											<TableCell
												align="center"
												className={classes.tablePoints}
											>
												{row.points}
												&nbsp; points
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
						<div className={classes.buttonDiv}>
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
	);
}
