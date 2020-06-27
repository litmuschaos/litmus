import React, { Fragment, useState } from "react";
import { Typography, Card, CardActionArea } from "@material-ui/core";
import { useStyles } from "./style";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import CustomInfoFilled from "../../components/CustomInfoFilled/index";
import QuickActionCard from "../../components/QuickActionCard";
import { Scaffold } from "../../containers/layouts";
import { useHistory } from "react-router-dom";

const CreateWorkflowCard = () => {
	const classes = useStyles();
	const history = useHistory();

	const routeChange = () => {
		let path = `/workflow`;
		history.push(path);
	};
	return (
		<Card
			elevation={3}
			className={classes.createWorkflowCard}
			onClick={() => {
				routeChange();
			}}
		>
			<CardActionArea>
				<Typography className={classes.createWorkflowHeading}>
					Let's Start
				</Typography>
				<Typography className={classes.createWorkflowTitle}>
					Create your workflow
				</Typography>
				<ArrowForwardIcon className={classes.arrowForwardIcon} />
			</CardActionArea>
		</Card>
	);
};

export default function HomePage() {
	const [userName, setUserName] = useState("Richard Hill");
	const classes = useStyles();
	return (
		<Scaffold>
			<div className={classes.rootContainer}>
				<div className={classes.root}>
					<Typography className={classes.userName}>
						Welcome, <strong>{userName}</strong>
					</Typography>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
						}}
					>
						<div style={{ width: "65%" }}>
							<div className={classes.mainDiv}>
								<Typography className={classes.mainHeading}>
									<strong>Congratulations!</strong>
								</Typography>
								<Typography className={classes.mainResult}>
									<strong>
										Litmus portal is successfully running on
										your Kubernetes cluster{" "}
									</strong>
								</Typography>
								<Typography className={classes.mainDesc}>
									No reliabilirt information to display. Once
									you schedule chaos workflows, reliability
									analytics are displayed here.
								</Typography>
							</div>
						</div>
						<div>
							<CreateWorkflowCard />
						</div>
					</div>
					<div className={classes.statsDiv}>
						<div style={{ width: "65%" }}>
							<Typography className={classes.statsHeading}>
								<strong>
									A quick peek about how busy Litmus is
								</strong>
							</Typography>
							<div
								style={{
									display: "flex",
									flexDirection: "row",
								}}
							>
								<CustomInfoFilled
									color="#109B67"
									value={"11.2K"}
									statType={"Operator Installed"}
								/>
								<CustomInfoFilled
									color="#858CDD"
									value={"29+"}
									statType={"Total Experiments"}
								/>
								<CustomInfoFilled
									color="#F6B92B"
									value={"60K+"}
									statType={"Total Runs Experiments"}
								/>
								<CustomInfoFilled
									color="#BA3B34"
									value={"800+"}
									statType={"Github Stars"}
								/>
							</div>
						</div>
						<div className={classes.quickActionDiv}>
							<QuickActionCard />
						</div>
					</div>
				</div>
			</div>
		</Scaffold>
	);
}
