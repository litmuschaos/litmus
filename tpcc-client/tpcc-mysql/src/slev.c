/*
 * -*-C-*-
 * slev.pc 
 * corresponds to A.5 in appendix A
 */

#include <string.h>
#include <stdio.h>

#include <mysql.h>

#include "spt_proc.h"
#include "tpc.h"

extern MYSQL **ctx;
extern MYSQL_STMT ***stmt;

/*
 * the stock level transaction
 */
int slev( int t_num,
	  int w_id_arg,		/* warehouse id */
	  int d_id_arg,		/* district id */
	  int level_arg		/* stock level */
)
{
	int            w_id = w_id_arg;
	int            d_id = d_id_arg;
	int            level = level_arg;
	int            d_next_o_id;
	int            i_count;
	int            ol_i_id;

	MYSQL_STMT*   mysql_stmt;
        MYSQL_BIND    param[4];
        MYSQL_BIND    column[1];
	MYSQL_STMT*   mysql_stmt2;
        MYSQL_BIND    param2[3];
        MYSQL_BIND    column2[1];

	/*EXEC SQL WHENEVER NOT FOUND GOTO sqlerr;*/
	/*EXEC SQL WHENEVER SQLERROR GOTO sqlerr;*/

	/* find the next order id */
#ifdef DEBUG
	printf("select 1\n");
#endif
	/*EXEC_SQL SELECT d_next_o_id
	                INTO :d_next_o_id
	                FROM district
	                WHERE d_id = :d_id
			AND d_w_id = :w_id;*/
	mysql_stmt = stmt[t_num][32];

	memset(param, 0, sizeof(MYSQL_BIND) * 2); /* initialize */
	param[0].buffer_type = MYSQL_TYPE_LONG;
	param[0].buffer = &d_id;
	param[1].buffer_type = MYSQL_TYPE_LONG;
	param[1].buffer = &w_id;
	if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
	if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;

	if( mysql_stmt_store_result(mysql_stmt) ) goto sqlerr;
	memset(column, 0, sizeof(MYSQL_BIND) * 1); /* initialize */
	column[0].buffer_type = MYSQL_TYPE_LONG;
	column[0].buffer = &d_next_o_id;
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

	/* find the most recent 20 orders for this district */
	/*EXEC_SQL DECLARE ord_line CURSOR FOR
	                SELECT DISTINCT ol_i_id
	                FROM order_line
	                WHERE ol_w_id = :w_id
			AND ol_d_id = :d_id
			AND ol_o_id < :d_next_o_id
			AND ol_o_id >= (:d_next_o_id - 20);

	EXEC_SQL OPEN ord_line;

	EXEC SQL WHENEVER NOT FOUND GOTO done;*/
	mysql_stmt = stmt[t_num][33];

	memset(param, 0, sizeof(MYSQL_BIND) * 4); /* initialize */
	param[0].buffer_type = MYSQL_TYPE_LONG;
	param[0].buffer = &w_id;
	param[1].buffer_type = MYSQL_TYPE_LONG;
	param[1].buffer = &d_id;
	param[2].buffer_type = MYSQL_TYPE_LONG;
	param[2].buffer = &d_next_o_id;
	param[3].buffer_type = MYSQL_TYPE_LONG;
	param[3].buffer = &d_next_o_id;
	if( mysql_stmt_bind_param(mysql_stmt, param) ) goto sqlerr;
	if( mysql_stmt_execute(mysql_stmt) ) goto sqlerr;

	if( mysql_stmt_store_result(mysql_stmt) ) goto sqlerr;
	memset(column, 0, sizeof(MYSQL_BIND) * 1); /* initialize */
	column[0].buffer_type = MYSQL_TYPE_LONG;
	column[0].buffer = &ol_i_id;
	if( mysql_stmt_bind_result(mysql_stmt, column) ) goto sqlerr;

	for (;;) {
#ifdef DEBUG
		printf("fetch 1\n");
#endif
		/*EXEC_SQL FETCH ord_line INTO :ol_i_id;*/
		switch( mysql_stmt_fetch(mysql_stmt) ) {
                    case 0: //SUCCESS
                        break;
                    case MYSQL_NO_DATA: //NO MORE DATA
                        mysql_stmt_free_result(mysql_stmt);
                        goto done;
                    case 1: //ERROR
                    default:
                        mysql_stmt_free_result(mysql_stmt);
                        goto sqlerr;
                }

#ifdef DEBUG
		printf("select 2\n");
#endif

		/*EXEC_SQL SELECT count(*) INTO :i_count
			FROM stock
			WHERE s_w_id = :w_id
		        AND s_i_id = :ol_i_id
			AND s_quantity < :level;*/
		mysql_stmt2 = stmt[t_num][34];

		memset(param2, 0, sizeof(MYSQL_BIND) * 3); /* initialize */
		param2[0].buffer_type = MYSQL_TYPE_LONG;
		param2[0].buffer = &w_id;
		param2[1].buffer_type = MYSQL_TYPE_LONG;
		param2[1].buffer = &ol_i_id;
		param2[2].buffer_type = MYSQL_TYPE_LONG;
		param2[2].buffer = &level;
		if( mysql_stmt_bind_param(mysql_stmt2, param2) ) goto sqlerr2;
		if( mysql_stmt_execute(mysql_stmt2) ) goto sqlerr2;

		if( mysql_stmt_store_result(mysql_stmt2) ) goto sqlerr2;
		memset(column2, 0, sizeof(MYSQL_BIND) * 1); /* initialize */
		column2[0].buffer_type = MYSQL_TYPE_LONG;
		column2[0].buffer = &i_count;
		if( mysql_stmt_bind_result(mysql_stmt2, column2) ) goto sqlerr2;
		switch( mysql_stmt_fetch(mysql_stmt2) ) {
		    case 0: //SUCCESS
			break;
		    case 1: //ERROR
		    case MYSQL_NO_DATA: //NO MORE DATA
		    default:
			mysql_stmt_free_result(mysql_stmt2);
			goto sqlerr2;
		}
		mysql_stmt_free_result(mysql_stmt2);

	}

done:
	/*EXEC_SQL CLOSE ord_line;*/
	/*EXEC_SQL COMMIT WORK;*/
	if( mysql_commit(ctx[t_num]) ) goto sqlerr;

	return (1);

sqlerr:
        fprintf(stderr,"slev\n");
	error(ctx[t_num],mysql_stmt);
        /*EXEC SQL WHENEVER SQLERROR GOTO sqlerrerr;*/
	/*EXEC_SQL ROLLBACK WORK;*/
	mysql_rollback(ctx[t_num]);
sqlerrerr:
	return (0);

sqlerr2:
        fprintf(stderr,"slev\n");
	error(ctx[t_num],mysql_stmt2);
        /*EXEC SQL WHENEVER SQLERROR GOTO sqlerrerr;*/
	/*EXEC_SQL ROLLBACK WORK;*/
	mysql_stmt_free_result(mysql_stmt);
	mysql_rollback(ctx[t_num]);
	return (0);
}
