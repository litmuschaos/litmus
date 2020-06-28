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
					Schedule your first workflow
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
					<div className={classes.headingDiv}>
						<div style={{ width: "65%" }}>
							<div className={classes.mainDiv}>
								<Typography className={classes.mainHeading}>
									<strong>Congratulations!</strong>
								</Typography>
								<Typography className={classes.mainResult}>
									<strong>
										You have established your own first
										project on Litmus portal.{" "}
									</strong>
								</Typography>
								<Typography className={classes.mainDesc}>
									Now this is successfully running on your
									Kubernetes cluster. Once you schedule chaos
									workflows, reliability analytics are
									displayed here.
								</Typography>
							</div>
						</div>
						<div className={classes.createWorkflow}>
							<CreateWorkflowCard />
						</div>
					</div>
					<div className={classes.contentDiv}>
						<div className={classes.statDiv}>
							<Typography className={classes.statsHeading}>
								<strong>How busy Litmus Project is?</strong>
							</Typography>
							<div className={classes.cardDiv}>
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
