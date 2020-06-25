import {
	Drawer as DrawerMui,
	FormControl,
	Hidden,
	InputLabel,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	MenuItem,
	Select,
	Divider,
} 
from "@material-ui/core";
import HomeIcon from "@material-ui/icons/HomeTwoTone";
import ContributeIcon from "@material-ui/icons/ReceiptTwoTone";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useActions } from "../../redux/actions";
import * as VersionActions from "../../redux/actions/versions";
import { history } from "../../redux/configureStore";
import { RootState } from "../../redux/reducers";
import { useStyles } from "./styles";
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

function Drawer() {
	const classes = useStyles();


	return (
		<>
			
		<div
		className={classes.litmusDiv}
		>
		<img
				src="./icons/litmus.svg"
				alt="litmus logo"
				className={classes.logo}
			/>
		<span className={classes.litmusHome}>Litmus</span>
		</div>
			

			<List className={classes.drawerList}>
				<CustomisedListItem
					key="home"
					handleClick={() => history.push("/chaostoolkit")}
					label="Home"
				>
					<img
				src="./icons/homeDark.png"
				alt="homeIcon"
				
			/>
				</CustomisedListItem>
				<CustomisedListItem
					key="home"
					handleClick={() => history.push("/chaostoolkit")}
					label="Workflows"
				>
					<img
				src="./icons/workflows.png"
				alt="homeIcon"
				
			/>
				</CustomisedListItem>
				<CustomisedListItem
					key="Settings"
					handleClick={() => history.push("/chaostoolkit")}
					label="Experiments"
				>
					<img
				src="./icons/experiments.png"
				alt="homeIcon"
				
			/>
				</CustomisedListItem>
				<CustomisedListItem
					key="home"
					handleClick={() => history.push("/chaostoolkit")}
					label="Settings"
				>
					<img
				src="./icons/settings.png"
				alt="homeIcon"
				
			/>
				</CustomisedListItem>
				<CustomisedListItem
					key="home"
					handleClick={() => history.push("/chaostoolkit")}
					label="Support"
				>
					<img
				src="./icons/support.png"
				alt="homeIcon"
				
			/>
				</CustomisedListItem>
				
			</List>
		</>
	);
}

function AppDrawer() {
	const classes = useStyles();
	const [mobileOpen, setMobileOpen] = React.useState(true);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};
	return (
		<>
			<Hidden mdUp>
				<DrawerMui
					variant="temporary"
					anchor={"left"}
					open={mobileOpen}
					classes={{
						paper: classes.drawerPaper,
					}}
					onClose={handleDrawerToggle}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
				>
					<Drawer />
				</DrawerMui>
			</Hidden>
			<Hidden smDown>
				<DrawerMui
					variant="permanent"
					open
					classes={{
						paper: classes.drawerPaper,
					}}
				>
					<Drawer />
				</DrawerMui>
			</Hidden>
		</>
	);
}

export default function withSidebar(Component: any) {
	function WithSidebar(props: object) {
		const classes = useStyles();
		return (
			<div className={classes.root}>
				<AppDrawer />
				<div className={classes.route}>
					<Component />
				</div>
			</div>
		);
	}

	return WithSidebar;
}
