import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MailIcon from "@material-ui/icons/Mail";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import React from "react";
import { useStyles } from "./styles";
import { Typography } from "@material-ui/core";

export function SideBar() {
	const classes = useStyles();
	
	interface ListItemProps {
		handleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
		children: JSX.Element;
		label: string;
	}

	const CustomisedListItem = (props: ListItemProps) => {
		const classes = useStyles();
		const { children, handleClick, label } = props;
		return (
			<ListItem
				button
				onClick={handleClick}
				
				className={classes.drawerListItem}
			>
				<ListItemIcon className={classes.listIcon}>{children}</ListItemIcon>
				<ListItemText primary={label} className={classes.listText}/>
			</ListItem>
		);
	};
	

	return (
		<Drawer
			className={classes.drawer}
			variant="permanent"
			classes={{
				paper: classes.drawerPaper,
			}}
			anchor="left"
		>
		<div
		className={classes.litmusDiv}
		>
		<img
				src="./icons/litmusPurple.svg"
				alt="litmus logo"
				className={classes.logo}
			/>
		<Typography className={classes.litmusHome}  variant="body1"> 
			Litmus
		</Typography>
		</div>
			
		<List className={classes.drawerList}>
			
				<CustomisedListItem
					key="home"
					handleClick={() => {}}
					label="Workflows"
				>
					<img
				src="./icons/workflows.png"
				alt="homeIcon"
				
			/>
				</CustomisedListItem>
				<CustomisedListItem
					key="Settings"
					handleClick={() => {}}
					label="Experiments"
				>
					<img
				src="./icons/experiments.png"
				alt="homeIcon"
				
			/>
				</CustomisedListItem>
				<CustomisedListItem
					key="home"
					handleClick={() => {}}
					label="Settings"
				>
					<img
				src="./icons/settings.png"
				alt="homeIcon"
				
			/>
				</CustomisedListItem>
				<CustomisedListItem
					key="home"
					handleClick={() => {}}
					label="Support"
				>
					<img
				src="./icons/support.png"
				alt="homeIcon"
				
			/>
				</CustomisedListItem>
				
			</List>
			
			
		</Drawer>
	);
}
