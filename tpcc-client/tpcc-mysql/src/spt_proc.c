/*
 * spt_proc.pc
 * support routines for the proc tpcc implementation
 */

#include <mysql.h>

#include <stdio.h>

/*
 * report error
 */
int error(
    MYSQL        *mysql,
    MYSQL_STMT   *mysql_stmt
)
{
/*
	if(mysql_stmt) {
	    printf("\n%d, %s, %s", mysql_stmt_errno(mysql_stmt),
		   mysql_stmt_sqlstate(mysql_stmt), mysql_stmt_error(mysql_stmt) );
	}
*/
	if(mysql){
	    fprintf(stderr, "%d, %s, %s\n", mysql_errno(mysql), mysql_sqlstate(mysql), mysql_error(mysql) );
	}
	return (0);
}


