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
			<Typography className={classes.mainHeader}>
				Quick Actions
			</Typography>
			<List>
				<QuickActionItems>
					<Fragment>
						<img src="icons/cluster.png" alt="cluster image" />
						<Link to="#" className={classes.listItem}>
							Connect a new cluster
						</Link>
					</Fragment>
				</QuickActionItems>
				<QuickActionItems>
					<Fragment>
						<img src="icons/team.png" alt="team image" />
						<Link to="#" className={classes.listItem}>
							Invite a team member
						</Link>
					</Fragment>
				</QuickActionItems>
				<QuickActionItems>
					<Fragment>
						<img src="icons/survey.png" alt="survey image" />
						<Link to="#" className={classes.listItem}>
							Take a quick survey
						</Link>
					</Fragment>
				</QuickActionItems>
				<QuickActionItems>
					<Fragment>
						<img src="icons/docs.png" alt="docs image" />
						<Link to="#" className={classes.listItem}>
							Read Litmus docs
						</Link>
					</Fragment>
				</QuickActionItems>
			</List>
		</div>
	);
};
export default QuickActionCard;
