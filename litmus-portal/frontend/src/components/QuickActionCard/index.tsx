import React, { Fragment } from "react";
import { List, ListItem, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useStyles } from "./style";

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
export default QuickActionCard;
