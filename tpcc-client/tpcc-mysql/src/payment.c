/*
 * -*-C-*-  
 * payment.pc 
 * corresponds to A.2 in appendix A
 */

#include <string.h>
#include <stdio.h>
#include <time.h>

#include <mysql.h>

#include "spt_proc.h"
#include "tpc.h"

extern MYSQL **ctx;
extern MYSQL_STMT ***stmt;

#define NNULL ((void *)0)

/*
 * the payment transaction
 */
int payment( int t_num,
	     int w_id_arg,		/* warehouse id */
	     int d_id_arg,		/* district id */
	     int byname,		/* select by c_id or c_last? */
	     int c_w_id_arg,
	     int c_d_id_arg,
	     int c_id_arg,		/* customer id */
	     char c_last_arg[],	        /* customer last name */
	     float h_amount_arg	        /* payment amount */
)
{
	int            w_id = w_id_arg;
	int            d_id = d_id_arg;
	int            c_id = c_id_arg;
	char            w_name[11];
	char            w_street_1[21];
	char            w_street_2[21];
	char            w_city[21];
	char            w_state[3];
	char            w_zip[10];
	int            c_d_id = c_d_id_arg;
	int            c_w_id = c_w_id_arg;
	char            c_first[17];
	char            c_middle[3];
	char            c_last[17];
	char            c_street_1[21];
	char            c_street_2[21];
	char            c_city[21];
	char            c_state[3];
	char            c_zip[10];
	char            c_phone[17];
	char            c_since[20];
	char            c_credit[4];
	int            c_credit_lim;
	float           c_discount;
	float           c_balance;
	char            c_data[502];
	char            c_new_data[502];
	float           h_amount = h_amount_arg;
	char            h_data[26];
	char            d_name[11];
	char            d_street_1[21];
	char            d_street_2[21];
	char            d_city[21];
	char            d_state[3];
	char            d_zip[10];
	int            namecnt;
	char            datetime[81];

	int             n;
	int             proceed = 0;

	MYSQL_STMT*   mysql_stmt;
        MYSQL_BIND    param[8];
        MYSQL_BIND    column[14];

	/* EXEC SQL WHENEVER NOT FOUND GOTO sqlerr; */
	/* EXEC SQL WHENEVER SQLERROR GOTO sqlerr; */

	gettimestamp(datetime, STRFTIME_FORMAT, TIMESTAMP_LEN);

	proceed = 1;
	/*EXEC_SQL UPDATE warehouse SET w_ytd = w_ytd + :h_amount
	  WHERE w_id =:w_id;*/
	mysql_stmt = stmt[t_num][9];

	memset(param, 0, sizeof(MYSQL_BIND) * 2); /* initialize */
	param[0].buffer_type = MYSQL_TYPE_FLOAT;
        param[0].buffer = &h_amount;
        param[1].buffer_type = MYSQL_TYPE_LONG;
        param[1].buffer = &w_id;
	if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
        if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;


	proceed = 2;
	/*EXEC_SQL SELECT w_street_1, w_street_2, w_city, w_state, w_zip,
	                w_name
	                INTO :w_street_1, :w_street_2, :w_city, :w_state,
				:w_zip, :w_name
	                FROM warehouse
	                WHERE w_id = :w_id;*/
	mysql_stmt = stmt[t_num][10];

	memset(param, 0, sizeof(MYSQL_BIND) * 1); /* initialize */
	param[0].buffer_type = MYSQL_TYPE_LONG;
        param[0].buffer = &w_id;
	if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
        if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;

	if( mysql_stmt_store_result(mysql_stmt) ) goto sqlerr;
        memset(column, 0, sizeof(MYSQL_BIND) * 6); /* initialize */
	column[0].buffer_type = MYSQL_TYPE_STRING;
        column[0].buffer = w_street_1;
        column[0].buffer_length = sizeof(w_street_1);
	column[1].buffer_type = MYSQL_TYPE_STRING;
        column[1].buffer = w_street_2;
        column[1].buffer_length = sizeof(w_street_2);
	column[2].buffer_type = MYSQL_TYPE_STRING;
        column[2].buffer = w_city;
        column[2].buffer_length = sizeof(w_city);
	column[3].buffer_type = MYSQL_TYPE_STRING;
        column[3].buffer = w_state;
        column[3].buffer_length = sizeof(w_state);
	column[4].buffer_type = MYSQL_TYPE_STRING;
        column[4].buffer = w_zip;
        column[4].buffer_length = sizeof(w_zip);
	column[5].buffer_type = MYSQL_TYPE_STRING;
        column[5].buffer = w_name;
        column[5].buffer_length = sizeof(w_name);
	if( mysql_stmt_bind_result(mysql_stmt, column) ) goto sqlerr;
        switch( mysql_stmt_fetch(mysql_stmt) ) {
            case 0: //SUCCESS
                break;
            case 1: //ERROR
            case MYSQL_NO_DATA: //NO MORE DATA
            default:
                mysql_stmt_free_result(mysql_stmt);
                goto sqlerr;
        }
        mysql_stmt_free_result(mysql_stmt);


	proceed = 3;
	/*EXEC_SQL UPDATE district SET d_ytd = d_ytd + :h_amount
			WHERE d_w_id = :w_id 
			AND d_id = :d_id;*/
	mysql_stmt = stmt[t_num][11];

        memset(param, 0, sizeof(MYSQL_BIND) * 3); /* initialize */
	param[0].buffer_type = MYSQL_TYPE_FLOAT;
        param[0].buffer = &h_amount;
        param[1].buffer_type = MYSQL_TYPE_LONG;
        param[1].buffer = &w_id;
        param[2].buffer_type = MYSQL_TYPE_LONG;
        param[2].buffer = &d_id;
	if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
        if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;


	proceed = 4;
	/*EXEC_SQL SELECT d_street_1, d_street_2, d_city, d_state, d_zip,
	                d_name
	                INTO :d_street_1, :d_street_2, :d_city, :d_state,
				:d_zip, :d_name
	                FROM district
	                WHERE d_w_id = :w_id 
			AND d_id = :d_id;*/
	mysql_stmt = stmt[t_num][12];

	memset(param, 0, sizeof(MYSQL_BIND) * 2); /* initialize */
	param[0].buffer_type = MYSQL_TYPE_LONG;
        param[0].buffer = &w_id;
	param[1].buffer_type = MYSQL_TYPE_LONG;
        param[1].buffer = &d_id;
	if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
        if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;

	if( mysql_stmt_store_result(mysql_stmt) ) goto sqlerr;
        memset(column, 0, sizeof(MYSQL_BIND) * 6); /* initialize */
	column[0].buffer_type = MYSQL_TYPE_STRING;
        column[0].buffer = d_street_1;
        column[0].buffer_length = sizeof(d_street_1);
	column[1].buffer_type = MYSQL_TYPE_STRING;
        column[1].buffer = d_street_2;
        column[1].buffer_length = sizeof(d_street_2);
	column[2].buffer_type = MYSQL_TYPE_STRING;
        column[2].buffer = d_city;
        column[2].buffer_length = sizeof(d_city);
	column[3].buffer_type = MYSQL_TYPE_STRING;
        column[3].buffer = d_state;
        column[3].buffer_length = sizeof(d_state);
	column[4].buffer_type = MYSQL_TYPE_STRING;
        column[4].buffer = d_zip;
        column[4].buffer_length = sizeof(d_zip);
	column[5].buffer_type = MYSQL_TYPE_STRING;
        column[5].buffer = d_name;
        column[5].buffer_length = sizeof(d_name);
	if( mysql_stmt_bind_result(mysql_stmt, column) ) goto sqlerr;
        switch( mysql_stmt_fetch(mysql_stmt) ) {
            case 0: //SUCCESS
                break;
            case 1: //ERROR
            case MYSQL_NO_DATA: //NO MORE DATA
            default:
                mysql_stmt_free_result(mysql_stmt);
                goto sqlerr;
        }
        mysql_stmt_free_result(mysql_stmt);


	if (byname) {
		strcpy(c_last, c_last_arg);

		proceed = 5;
		/*EXEC_SQL SELECT count(c_id) 
			INTO :namecnt
		        FROM customer
			WHERE c_w_id = :c_w_id
			AND c_d_id = :c_d_id
		        AND c_last = :c_last;*/
		mysql_stmt = stmt[t_num][13];

		memset(param, 0, sizeof(MYSQL_BIND) * 3); /* initialize */
		param[0].buffer_type = MYSQL_TYPE_LONG;
		param[0].buffer = &c_w_id;
		param[1].buffer_type = MYSQL_TYPE_LONG;
		param[1].buffer = &c_d_id;
		param[2].buffer_type = MYSQL_TYPE_STRING;
		param[2].buffer = c_last;
		param[2].buffer_length = strlen(c_last);
		if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
		if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;

		if( mysql_stmt_store_result(mysql_stmt) ) goto sqlerr;
		memset(column, 0, sizeof(MYSQL_BIND) * 1); /* initialize */
		column[0].buffer_type = MYSQL_TYPE_LONG;
		column[0].buffer = &namecnt;
		if( mysql_stmt_bind_result(mysql_stmt, column) ) goto sqlerr;
		switch( mysql_stmt_fetch(mysql_stmt) ) {
		    case 0: //SUCCESS
			break;
		    case 1: //ERROR
		    case MYSQL_NO_DATA: //NO MORE DATA
		    default:
			mysql_stmt_free_result(mysql_stmt);
			goto sqlerr;
		}
		mysql_stmt_free_result(mysql_stmt);

		/*EXEC_SQL DECLARE c_byname_p CURSOR FOR
		        SELECT c_id
		        FROM customer
		        WHERE c_w_id = :c_w_id 
			AND c_d_id = :c_d_id 
			AND c_last = :c_last
			ORDER BY c_first;

			EXEC_SQL OPEN c_byname_p;*/
		mysql_stmt = stmt[t_num][14];

		memset(param, 0, sizeof(MYSQL_BIND) * 3); /* initialize */
		param[0].buffer_type = MYSQL_TYPE_LONG;
		param[0].buffer = &c_w_id;
		param[1].buffer_type = MYSQL_TYPE_LONG;
		param[1].buffer = &c_d_id;
		param[2].buffer_type = MYSQL_TYPE_STRING;
		param[2].buffer = c_last;
		param[2].buffer_length = strlen(c_last);
		if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
		if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;

		if( mysql_stmt_store_result(mysql_stmt) ) goto sqlerr;
		memset(column, 0, sizeof(MYSQL_BIND) * 1); /* initialize */
		column[0].buffer_type = MYSQL_TYPE_LONG;
		column[0].buffer = &c_id;
		if( mysql_stmt_bind_result(mysql_stmt, column) ) goto sqlerr;

		if (namecnt % 2) 
			namecnt++;	/* Locate midpoint customer; */
		for (n = 0; n < namecnt / 2; n++) {
		    /*EXEC_SQL FETCH c_byname_p
		      INTO :c_id;*/
		    switch( mysql_stmt_fetch(mysql_stmt) ) {
			case 0: //SUCCESS
			    break;
			case 1: //ERROR
			case MYSQL_NO_DATA: //NO MORE DATA
			default:
			    mysql_stmt_free_result(mysql_stmt);
			    goto sqlerr;
		    }
		}

		/*EXEC_SQL CLOSE c_byname_p; */
		mysql_stmt_free_result(mysql_stmt);

	}

	proceed = 6;
	/*EXEC_SQL SELECT c_first, c_middle, c_last, c_street_1,
		        c_street_2, c_city, c_state, c_zip, c_phone,
		        c_credit, c_credit_lim, c_discount, c_balance,
		        c_since
		INTO :c_first, :c_middle, :c_last, :c_street_1,
		     :c_street_2, :c_city, :c_state, :c_zip, :c_phone,
		     :c_credit, :c_credit_lim, :c_discount, :c_balance,
		     :c_since
		FROM customer
	        WHERE c_w_id = :c_w_id 
	        AND c_d_id = :c_d_id 
		AND c_id = :c_id
		FOR UPDATE;*/
	mysql_stmt = stmt[t_num][15];

	memset(param, 0, sizeof(MYSQL_BIND) * 3); /* initialize */
	param[0].buffer_type = MYSQL_TYPE_LONG;
        param[0].buffer = &c_w_id;
        param[1].buffer_type = MYSQL_TYPE_LONG;
        param[1].buffer = &c_d_id;
        param[2].buffer_type = MYSQL_TYPE_LONG;
        param[2].buffer = &c_id;
	if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
        if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;

	if( mysql_stmt_store_result(mysql_stmt) ) goto sqlerr;
        memset(column, 0, sizeof(MYSQL_BIND) * 14); /* initialize */
	column[0].buffer_type = MYSQL_TYPE_STRING;
        column[0].buffer = c_first;
        column[0].buffer_length = sizeof(c_first);
	column[1].buffer_type = MYSQL_TYPE_STRING;
        column[1].buffer = c_middle;
        column[1].buffer_length = sizeof(c_middle);
	column[2].buffer_type = MYSQL_TYPE_STRING;
        column[2].buffer = c_last;
        column[2].buffer_length = sizeof(c_last);
	column[3].buffer_type = MYSQL_TYPE_STRING;
        column[3].buffer = c_street_1;
        column[3].buffer_length = sizeof(c_street_1);
	column[4].buffer_type = MYSQL_TYPE_STRING;
        column[4].buffer = c_street_2;
        column[4].buffer_length = sizeof(c_street_2);
	column[5].buffer_type = MYSQL_TYPE_STRING;
        column[5].buffer = c_city;
        column[5].buffer_length = sizeof(c_city);
	column[6].buffer_type = MYSQL_TYPE_STRING;
        column[6].buffer = c_state;
        column[6].buffer_length = sizeof(c_state);
	column[7].buffer_type = MYSQL_TYPE_STRING;
        column[7].buffer = c_zip;
        column[7].buffer_length = sizeof(c_zip);
	column[8].buffer_type = MYSQL_TYPE_STRING;
        column[8].buffer = c_phone;
        column[8].buffer_length = sizeof(c_phone);
	column[9].buffer_type = MYSQL_TYPE_STRING;
        column[9].buffer = c_credit;
        column[9].buffer_length = sizeof(c_credit);
	column[10].buffer_type = MYSQL_TYPE_LONG;
        column[10].buffer = &c_credit_lim;
	column[11].buffer_type = MYSQL_TYPE_FLOAT;
        column[11].buffer = &c_discount;
	column[12].buffer_type = MYSQL_TYPE_FLOAT;
        column[12].buffer = &c_balance;
	column[13].buffer_type = MYSQL_TYPE_STRING;
        column[13].buffer = c_since;
        column[13].buffer_length = sizeof(c_since);
	if( mysql_stmt_bind_result(mysql_stmt, column) ) goto sqlerr;
        switch( mysql_stmt_fetch(mysql_stmt) ) {
            case 0: //SUCCESS
	    case MYSQL_DATA_TRUNCATED:
                break;
            case 1: //ERROR
            case MYSQL_NO_DATA: //NO MORE DATA
            default:
                mysql_stmt_free_result(mysql_stmt);
                goto sqlerr;
        }
        mysql_stmt_free_result(mysql_stmt);



	c_balance = c_balance - h_amount;
	c_credit[2] = '\0';
	if (strstr(c_credit, "BC")) {
		proceed = 7;
		/*EXEC_SQL SELECT c_data 
			INTO :c_data
		        FROM customer
		        WHERE c_w_id = :c_w_id 
			AND c_d_id = :c_d_id 
			AND c_id = :c_id; */
		mysql_stmt = stmt[t_num][16];

		memset(param, 0, sizeof(MYSQL_BIND) * 3); /* initialize */
		param[0].buffer_type = MYSQL_TYPE_LONG;
		param[0].buffer = &c_w_id;
		param[1].buffer_type = MYSQL_TYPE_LONG;
		param[1].buffer = &c_d_id;
		param[2].buffer_type = MYSQL_TYPE_LONG;
		param[2].buffer = &c_id;
		if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
		if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;

		if( mysql_stmt_store_result(mysql_stmt) ) goto sqlerr;
		memset(column, 0, sizeof(MYSQL_BIND) * 1); /* initialize */
		column[0].buffer_type = MYSQL_TYPE_STRING;
		column[0].buffer = c_data;
		column[0].buffer_length = sizeof(c_data);
		if( mysql_stmt_bind_result(mysql_stmt, column) ) goto sqlerr;
		switch( mysql_stmt_fetch(mysql_stmt) ) {
		    case 0: //SUCCESS
			break;
		    case 1: //ERROR
		    case MYSQL_NO_DATA: //NO MORE DATA
		    default:
			mysql_stmt_free_result(mysql_stmt);
			goto sqlerr;
		}
		mysql_stmt_free_result(mysql_stmt);


		sprintf(c_new_data, 
			"| %4d %2d %4d %2d %4d $%7.2f %12c %24c",
			c_id, c_d_id, c_w_id, d_id,
			w_id, h_amount,
			datetime, c_data);

		strncat(c_new_data, c_data, 
			500 - strlen(c_new_data));

		c_new_data[500] = '\0';

		proceed = 8;
		/*EXEC_SQL UPDATE customer
			SET c_balance = :c_balance, c_data = :c_new_data
			WHERE c_w_id = :c_w_id 
			AND c_d_id = :c_d_id 
			AND c_id = :c_id;*/
		mysql_stmt = stmt[t_num][17];

		memset(param, 0, sizeof(MYSQL_BIND) * 5); /* initialize */
		param[0].buffer_type = MYSQL_TYPE_FLOAT;
		param[0].buffer = &c_balance;
		param[1].buffer_type = MYSQL_TYPE_STRING;
		param[1].buffer = c_data;
		param[1].buffer_length = strlen(c_data);
		param[2].buffer_type = MYSQL_TYPE_LONG;
		param[2].buffer = &c_w_id;
		param[3].buffer_type = MYSQL_TYPE_LONG;
		param[3].buffer = &c_d_id;
		param[4].buffer_type = MYSQL_TYPE_LONG;
		param[4].buffer = &c_id;
		if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
		if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;
	} else {
		proceed = 9;
		/*EXEC_SQL UPDATE customer 
			SET c_balance = :c_balance
			WHERE c_w_id = :c_w_id 
			AND c_d_id = :c_d_id 
			AND c_id = :c_id;*/
		mysql_stmt = stmt[t_num][18];

		memset(param, 0, sizeof(MYSQL_BIND) * 4); /* initialize */
		param[0].buffer_type = MYSQL_TYPE_FLOAT;
		param[0].buffer = &c_balance;
		param[1].buffer_type = MYSQL_TYPE_LONG;
		param[1].buffer = &c_w_id;
		param[2].buffer_type = MYSQL_TYPE_LONG;
		param[2].buffer = &c_d_id;
		param[3].buffer_type = MYSQL_TYPE_LONG;
		param[3].buffer = &c_id;
		if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
		if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;
	}
	strncpy(h_data, w_name, 10);
	h_data[10] = '\0';
	strncat(h_data, d_name, 10);
	h_data[20] = ' ';
	h_data[21] = ' ';
	h_data[22] = ' ';
	h_data[23] = ' ';
	h_data[24] = '\0';

	proceed = 10;
	/*EXEC_SQL INSERT INTO history(h_c_d_id, h_c_w_id, h_c_id, h_d_id,
			                   h_w_id, h_date, h_amount, h_data)
	                VALUES(:c_d_id, :c_w_id, :c_id, :d_id,
		               :w_id, 
			       :datetime,
			       :h_amount, :h_data);*/
	mysql_stmt = stmt[t_num][19];

	memset(param, 0, sizeof(MYSQL_BIND) * 8); /* initialize */
	param[0].buffer_type = MYSQL_TYPE_LONG;
	param[0].buffer = &c_d_id;
	param[1].buffer_type = MYSQL_TYPE_LONG;
	param[1].buffer = &c_w_id;
	param[2].buffer_type = MYSQL_TYPE_LONG;
	param[2].buffer = &c_id;
	param[3].buffer_type = MYSQL_TYPE_LONG;
	param[3].buffer = &d_id;
	param[4].buffer_type = MYSQL_TYPE_LONG;
	param[4].buffer = &w_id;
	param[5].buffer_type = MYSQL_TYPE_STRING;
	param[5].buffer = datetime;
	param[5].buffer_length = strlen(datetime);
	param[6].buffer_type = MYSQL_TYPE_FLOAT;
	param[6].buffer = &h_amount;
	param[7].buffer_type = MYSQL_TYPE_STRING;
	param[7].buffer = h_data;
	param[7].buffer_length = strlen(h_data);
	if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
        if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;

	/*EXEC_SQL COMMIT WORK;*/
	if( mysql_commit(ctx[t_num]) ) goto sqlerr;

	return (1);

sqlerr:
        fprintf(stderr, "payment %d:%d\n",t_num,proceed);
	error(ctx[t_num],mysql_stmt);
        /*EXEC SQL WHENEVER SQLERROR GOTO sqlerrerr;*/
	/*EXEC_SQL ROLLBACK WORK;*/
	mysql_rollback(ctx[t_num]);
sqlerrerr:
	return (0);
}
