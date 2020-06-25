import React, { Fragment, useState } from "react";
import {
	List,
	ListItem,
	Paper,
	Typography,
	Card,
	CardActionArea,
} from "@material-ui/core";
import { useStyles } from "./style";
import { Link } from "react-router-dom";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import CustomInfoFilled from "../../components/CustomInfoFilled/index";
interface CustomListItems {
	children: JSX.Element;
}

const QuickActionItems = (props: CustomListItems) => {
	const { children } = props;
	const classes = useStyles();
	return <ListItem className={classes.listItems}>{children}</ListItem>;
};

const QuickActionCard = () => {
	const classes = useStyles();
	return (
		<div className={classes.quickActionCard}>
			<Typography
				style={{ fontSize: 17, fontFamily: "Ubuntu", color: "#000000" }}
			>
				Quick Actions
			</Typography>
			<List>
				<QuickActionItems>
					<Fragment>
						<img src="icons/Cluster.png" />
						<Link to="#" className={classes.listItem}>
							Connect a new cluster
						</Link>
					</Fragment>
				</QuickActionItems>
				<QuickActionItems>
					<Fragment>
						<img src="icons/Cloud.png" />
						<Link to="#" className={classes.listItem}>
							Invite a team member
						</Link>
					</Fragment>
				</QuickActionItems>
				<QuickActionItems>
					<Fragment>
						<img src="icons/Folder.png" />
						<Link to="#" className={classes.listItem}>
							Take a quick survey
						</Link>
					</Fragment>
				</QuickActionItems>
				<QuickActionItems>
					<Fragment>
						<img src="icons/Server.png" />
						<Link to="#" className={classes.listItem}>
							Terms & Condition
						</Link>
					</Fragment>
				</QuickActionItems>
			</List>
		</div>
	);
};

const CreateWorkflowCard = () => {
	const classes = useStyles();
	return (
		<Card
			elevation={3}
			className={classes.createWorkflowCard}
			onClick={() => {
				console.log("Clicked Card");
			}}
		>
			<CardActionArea>
				<Typography className={classes.createWorkflowHeading}>
					Let's Start
				</Typography>
				<Typography className={classes.createWorkflowTitle}>
					Create your workflow
				</Typography>
				<ArrowForwardIcon
					style={{ color: "#5B44BA", marginLeft: 180, marginTop: 35 }}
				/>
			</CardActionArea>
		</Card>
	);
};

export default function HomePage() {
	const [userName, setUserName] = useState("Richard Hill");
	const classes = useStyles();
	return (
		<div className={classes.rootContainer}>
			<div style={{ marginTop: 80, marginLeft: 200 }}>
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
						<div style={{ marginLeft: 30, width: 600 }}>
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
								No reliabilirt information to display. Once you
								schedule chaos workflows, reliability analytics
								are displayed here.
							</Typography>
						</div>
					</div>
					<div>
						<CreateWorkflowCard />
					</div>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						marginTop: 30,
					}}
				>
					<div style={{ width: "65%" }}>
						<Typography
							style={{
								fontFamily: "Ubuntu",
								fontSize: 25,
								marginBottom: 30,
							}}
						>
							<strong>
								A quick peek about how busy Litmus is
							</strong>
						</Typography>
						<div style={{ display: "flex", flexDirection: "row" }}>
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

					<div>
						<QuickActionCard />
					</div>
				</div>
			</div>
		</div>
	);
}
