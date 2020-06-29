import React, { useState } from "react";
import calendar from "../../icons/calendar.png";
import {
	FormControl,
	Divider,
	Typography,
	Button,
	RadioGroup,
	FormControlLabel,
	Radio,
} from "@material-ui/core";

import { useStyles } from "./styles";

import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup";
import TextField from "@material-ui/core/TextField/TextField";
import CustomDate from "../../components/CustomDate/index";
import CustomTime from "../../components/CustomTime/index";
import CustomSchToggle from "../../components/CustomSchToggle/index";

function ScheduleWorkflow(this: any) {
	//controls radio buttons
	const classes = useStyles();
	const [value, setValue] = React.useState("now");
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(event.target.value);
	};

	const [valueDef, setValueDef] = React.useState("");
	const handleChangeInstance = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setValueDef(event.target.value);
	};

	const [clicks, setClicks] = useState<number>(0);

	const handleDecrement = () => {
		if (typeof clicks != "number" || clicks <= 0) setClicks(0);
		else setClicks(clicks - 1);
	};

	const handleIncrement = () => {
		if (typeof clicks != "number") setClicks(0);
		setClicks(clicks + 1);
	};

	const [formats, setFormats] = React.useState(() => [""]);

	const handleFormat = (
		event: React.MouseEvent<HTMLElement>,
		newFormats: string[]
	) => {
		setFormats(newFormats);
	};

	return (
		<div className={classes.root}>
			<div className={classes.scHeader}>
				<div className={classes.scSegments}>
					<div>
						<Typography
							variant="h6"
							align="left"
							className={classes.headerText}
						>
							<strong>Choose a chaos schedule</strong>
						</Typography>

						<div className={classes.schBody}>
							<Typography
								align="left"
								className={classes.description}
							>
								Choose the right time to start your first
								workflow. Below your first workflow. Below you
								can find any option convenient for you.
							</Typography>
						</div>
					</div>
					<img
						src={calendar}
						alt="calendar"
						className={classes.calIcon}
					/>
				</div>
				<Divider style={{ width: "56.31rem" }} />
				<div className={classes.scFormControl}>
					<FormControl
						component="fieldset"
						className={classes.formControl}
					>
						<RadioGroup
							aria-label="schedule"
							name="schedule"
							value={value}
							onChange={handleChange}
						>
							<FormControlLabel
								value="now"
								control={<Radio />}
								label={
									<Typography className={classes.radioText}>
										Schedule now
									</Typography>
								}
							/>
							<FormControlLabel
								value="laterOnce"
								control={<Radio />}
								label={
									<Typography className={classes.radioText}>
										Schedule later once
									</Typography>
								}
							/>
							<Typography
								align="left"
								className={classes.captionText}
							>
								Select date and time
							</Typography>
							{value == "laterOnce" ? (
								<div className={classes.schLater}>
									<CustomDate />
									<CustomTime ampm={true} />
								</div>
							) : (
								<></>
							)}
							<FormControlLabel
								value="laterWithinTime"
								control={<Radio />}
								label={
									<Typography className={classes.radioText}>
										Schedule later within a time frame
									</Typography>
								}
							/>
							{value == "laterWithinTime" ? (
								<div className={classes.wt}>
									<div className={classes.scInnerSegments}>
										<div className={classes.schWithinTime}>
											<div className={classes.wtDateTime}>
												<div
													className={classes.timeDate}
												>
													<Typography
														variant="body2"
														className={
															classes.wtCaptionText
														}
													>
														Start Date
													</Typography>
												</div>
												<CustomDate />
											</div>
											<div className={classes.wtDateTime}>
												<div
													className={classes.timeDate}
												>
													<Typography
														variant="body2"
														className={
															classes.wtCaptionText
														}
													>
														End Date
													</Typography>
												</div>
												<CustomDate />
											</div>
										</div>
									</div>
									<div className={classes.scInnerSegments}>
										<div className={classes.schWithinTime}>
											<div className={classes.wtDateTime}>
												<div
													className={classes.timeDate}
												>
													<Typography
														variant="body2"
														className={
															classes.wtCaptionText
														}
													>
														From time
													</Typography>
												</div>
												<CustomTime ampm={true} />
											</div>
											<div className={classes.wtDateTime}>
												<div
													className={classes.timeDate}
												>
													<Typography
														variant="body2"
														className={
															classes.wtCaptionText
														}
													>
														To time
													</Typography>
												</div>
												<CustomTime ampm={true} />
											</div>
										</div>
										<div className={classes.wtDays}>
											<div className={classes.timeDate}>
												<Typography
													variant="body2"
													className={
														classes.wtCaptionText
													}
												>
													Repeat on
												</Typography>
											</div>

											<ToggleButtonGroup
												value={formats}
												onChange={handleFormat}
											>
												<CustomSchToggle label="SUN" />
												<CustomSchToggle label="MON" />
												<CustomSchToggle label="TUE" />
												<CustomSchToggle label="WED" />
												<CustomSchToggle label="THUR" />
												<CustomSchToggle label="FRI" />
												<CustomSchToggle label="SAT" />
											</ToggleButtonGroup>
										</div>
									</div>
								</div>
							) : (
								<></>
							)}
							<FormControlLabel
								value="randomSelection"
								control={<Radio />}
								label={
									<Typography className={classes.radioText}>
										Randomly Scheduled within minimum
										interval period or specified instances
									</Typography>
								}
							/>
							{value == "randomSelection" ? (
								<div>
									<div className={classes.defInstance}>
										<Typography variant="subtitle1">
											<strong>Define Instances</strong>
										</Typography>
									</div>
									<div>
										<FormControl component="fieldset">
											<RadioGroup
												aria-label="instanceDef"
												name="instanceDef"
												value={valueDef}
												onChange={handleChangeInstance}
											>
												<FormControlLabel
													value="iCount"
													control={<Radio />}
													label="By Instances count"
												/>
												{valueDef == "iCount" ? (
													<div>
														<div
															className={
																classes.scRandom
															}
														>
															<Typography
																variant="subtitle1"
																className={
																	classes.scRandsub1
																}
															>
																Instances
															</Typography>
															<Button
																onClick={
																	handleDecrement
																}
																className={
																	classes.instButton
																}
															>
																-
															</Button>
															<TextField
																className={
																	classes.counterText
																}
																InputProps={{
																	disableUnderline: true,
																}}
																value={clicks}
																onChange={(e) => {
																	if (
																		isNaN(parseInt(e.target.value)																		)
																	) {
																
																		setClicks(0);
																	} else {
																		setClicks(
																			parseInt(e.target.value)
																		);
																	}
																}}
															/>
															<Button
																onClick={
																	handleIncrement
																}
																className={
																	classes.instButton
																}
															>
																+
															</Button>
														</div>
													</div>
												) : (
													<></>
												)}
												<FormControlLabel
													value="minInterval"
													control={<Radio />}
													label="By minimum interval"
												/>
												{valueDef == "minInterval" ? (
													<div>
														<div
															className={
																classes.scRandom
															}
														>
															<Typography
																variant="subtitle2"
																className={
																	classes.sub1
																}
																style={{
																	color:
																		"rgba(0, 0, 0, 0.4)",
																}}
															>
																Interval
															</Typography>
															<CustomTime
																ampm={false}
															/>
															<Typography
																variant="subtitle2"
																className={
																	classes.sub1
																}
															>
																Hours
															</Typography>
														</div>
													</div>
												) : (
													<></>
												)}
											</RadioGroup>
										</FormControl>
									</div>
								</div>
							) : (
								<></>
							)}
						</RadioGroup>
					</FormControl>
				</div>
			</div>
		</div>
	);
}

export default ScheduleWorkflow;
