import Breadcrumbs from "@material-ui/core/Breadcrumbs";
// import Link from "@material-ui/core/Link";
import NavigateNextIcon from "@material-ui/icons/NavigateNextTwoTone";
import * as React from "react";
import { Link } from "react-router-dom";
import { useStyles } from "./styles";
export function CustomBreadCrumbs(props: { location: string }) {
	const path: string[] = props.location.split("/");
	let intermediatRoutes: string = "/";
	const classes = useStyles();
	return (
		<Breadcrumbs
			separator={<NavigateNextIcon fontSize="small" />}
			aria-label="breadcrumb"
		>
			<Link to="/" className={classes.breadCrumb}>
				Home
			</Link>
			{path.map((p: string) => {
				if (p) {
					intermediatRoutes += p;
					const link = (
						<Link
							to={intermediatRoutes}
							className={classes.breadCrumb}
						>
							{p.charAt(0).toUpperCase() + p.slice(1)}
						</Link>
					);
					intermediatRoutes += "/";
					return link;
				}
				return "";
			})}
		</Breadcrumbs>
	);
}
