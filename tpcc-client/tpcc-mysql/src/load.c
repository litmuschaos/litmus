/*
 * corresponds to A.6 in appendix A
 */

/*
 * ==================================================================+ | Load
 * TPCC tables
 * +==================================================================
 */

#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <ctype.h>
#include <stdlib.h>
#include <time.h>
#include <fcntl.h>

#include <mysql.h>

#include "spt_proc.h"
#include "tpc.h"

#define NNULL ((void *)0)
//#undef NULL

MYSQL *mysql;
MYSQL_STMT *stmt[11];

/* Global SQL Variables */
char            timestamp[81];
long            count_ware;
int             fd, seed;

int             particle_flg = 0; /* "1" means particle mode */
int             part_no = 0; /* 1:items 2:warehouse 3:customer 4:orders */
long            min_ware = 1;
long            max_ware;

/* Global Variables */
int             i;
int             option_debug = 0;	/* 1 if generating debug output    */
int             is_local = 1;           /* "1" mean local */

#define DB_STRING_MAX 51

#include "parse_port.h"

int
try_stmt_execute(MYSQL_STMT *mysql_stmt)
{
    int ret = mysql_stmt_execute(mysql_stmt);
    if (ret) {
        printf("\n%d, %s, %s\n", mysql_errno(mysql), mysql_sqlstate(mysql), mysql_error(mysql) );
        mysql_rollback(mysql);
    }
    return ret;
}

/*
 * ==================================================================+ |
 * main() | ARGUMENTS |      Warehouses n [Debug] [Help]
 * +==================================================================
 */
void 
main(argc, argv)
	int             argc;
	char           *argv[];
{
	char            arg[2];
        char           *ptr;

	char           connect_string[DB_STRING_MAX];
	char           db_string[DB_STRING_MAX];
	char	       db_user[DB_STRING_MAX];
	char	       db_password[DB_STRING_MAX];
        int            port= 3306;

	int i,c;

	MYSQL* resp;

	/* initialize */
	count_ware = 0;

	printf("*************************************\n");
	printf("*** TPCC-mysql Data Loader        ***\n");
	printf("*************************************\n");

  /* Parse args */

    while ( (c = getopt(argc, argv, "h:P:d:u:p:w:l:m:n:")) != -1) {
        switch (c) {
        case 'h':
            printf ("option h with value '%s'\n", optarg);
            strncpy(connect_string, optarg, DB_STRING_MAX);
            break;
        case 'd':
            printf ("option d with value '%s'\n", optarg);
            strncpy(db_string, optarg, DB_STRING_MAX);
            break;
        case 'u':
            printf ("option u with value '%s'\n", optarg);
            strncpy(db_user, optarg, DB_STRING_MAX);
            break;
        case 'p':
            printf ("option p with value '%s'\n", optarg);
            strncpy(db_password, optarg, DB_STRING_MAX);
            break;
        case 'w':
            printf ("option w with value '%s'\n", optarg);
            count_ware = atoi(optarg);
            break;
        case 'l':
            printf ("option l with value '%s'\n", optarg);
            part_no = atoi(optarg);
	    particle_flg = 1;
            break;
        case 'm':
            printf ("option m with value '%s'\n", optarg);
            min_ware = atoi(optarg);
            break;
        case 'n':
            printf ("option n with value '%s'\n", optarg);
            max_ware = atoi(optarg);
            break;
        case 'P':
            printf ("option P with value '%s'\n", optarg);
            port = atoi(optarg);
            break;
        case '?':
    	    printf("Usage: tpcc_load -h server_host -P port -d database_name -u mysql_user -p mysql_password -w warehouses -l part -m min_wh -n max_wh\n");
    	    printf("* [part]: 1=ITEMS 2=WAREHOUSE 3=CUSTOMER 4=ORDERS\n");
            exit(0);
        default:
            printf ("?? getopt returned character code 0%o ??\n", c);
        }
    }
    if (optind < argc) {
        printf ("non-option ARGV-elements: ");
        while (optind < argc)
            printf ("%s ", argv[optind++]);
        printf ("\n");
    }

	if(strcmp(connect_string,"l")==0){
	  is_local = 1;
	}else{
	  is_local = 0;
	}

	if(particle_flg==0){
	    min_ware = 1;
	    max_ware = count_ware;
	}

	printf("<Parameters>\n");
	if(is_local==0)printf("     [server]: %s\n", connect_string);
	if(is_local==0)printf("     [port]: %d\n", port);
	printf("     [DBname]: %s\n", db_string);
	printf("       [user]: %s\n", db_user);
	printf("       [pass]: %s\n", db_password);

	printf("  [warehouse]: %d\n", count_ware);

	if(particle_flg==1){
	    printf("  [part(1-4)]: %d\n", part_no);
	    printf("     [MIN WH]: %d\n", min_ware);
	    printf("     [MAX WH]: %d\n", max_ware);
	}

	fd = open("/dev/urandom", O_RDONLY);
	if (fd == -1) {
	    fd = open("/dev/random", O_RDONLY);
	    if (fd == -1) {
		struct timeval  tv;
		gettimeofday(&tv, NNULL);
		seed = (tv.tv_sec ^ tv.tv_usec) * tv.tv_sec * tv.tv_usec ^ tv.tv_sec;
	    }else{
		read(fd, &seed, sizeof(seed));
		close(fd);
	    }
	}else{
	    read(fd, &seed, sizeof(seed));
	    close(fd);
	}
	SetSeed(seed);

	/* Initialize timestamp (for date columns) */
	gettimestamp(timestamp, STRFTIME_FORMAT, TIMESTAMP_LEN);

	/* EXEC SQL WHENEVER SQLERROR GOTO Error_SqlCall; */

	mysql = mysql_init(NULL);
	if(!mysql) goto Error_SqlCall;

	if(is_local==1){
	    /* exec sql connect :connect_string; */
	    resp = mysql_real_connect(mysql, "localhost", db_user, db_password, db_string, port, NULL, 0);
	}else{
	    /* exec sql connect :connect_string USING :db_string; */
	    resp = mysql_real_connect(mysql, connect_string, db_user, db_password, db_string, port, NULL, 0);
	}

	if(resp) {
	    mysql_autocommit(mysql, 0);
	    mysql_query(mysql, "SET UNIQUE_CHECKS=0");
	    mysql_query(mysql, "SET FOREIGN_KEY_CHECKS=0");
	} else {
	    goto Error_SqlCall_close;
	}

	for( i=0; i<11; i++ ){
	    stmt[i] = mysql_stmt_init(mysql);
	    if(!stmt[i]) goto Error_SqlCall_close;
	}

	if( mysql_stmt_prepare(stmt[0],
			       "INSERT INTO item values(?,?,?,?,?)",
			       34) ) goto Error_SqlCall_close;
	if( mysql_stmt_prepare(stmt[1],
			       "INSERT INTO warehouse values(?,?,?,?,?,?,?,?,?)",
			       47) ) goto Error_SqlCall_close;
	if( mysql_stmt_prepare(stmt[2],
			       "INSERT INTO stock values(?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0,?)",
			       59) ) goto Error_SqlCall_close;
	if( mysql_stmt_prepare(stmt[3],
			       "INSERT INTO district values(?,?,?,?,?,?,?,?,?,?,?)",
			       50) ) goto Error_SqlCall_close;
	if( mysql_stmt_prepare(stmt[4],
			       "INSERT INTO customer values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 10.0, 1, 0,?)",
			       76) ) goto Error_SqlCall_close;
	if( mysql_stmt_prepare(stmt[5],
			       "INSERT INTO history values(?,?,?,?,?,?,?,?)",
			       43) ) goto Error_SqlCall_close;
	if( mysql_stmt_prepare(stmt[6],
			       "INSERT INTO orders values(?,?,?,?,?,NULL,?, 1)",
			       46) ) goto Error_SqlCall_close;
	if( mysql_stmt_prepare(stmt[7],
			       "INSERT INTO new_orders values(?,?,?)",
			       36) ) goto Error_SqlCall_close;
	if( mysql_stmt_prepare(stmt[8],
			       "INSERT INTO orders values(?,?,?,?,?,?,?, 1)",
			       43) ) goto Error_SqlCall_close;
	if( mysql_stmt_prepare(stmt[9],
			       "INSERT INTO order_line values(?,?,?,?,?,?, NULL,?,?,?)",
			       54) ) goto Error_SqlCall_close;
	if( mysql_stmt_prepare(stmt[10],
			       "INSERT INTO order_line values(?,?,?,?,?,?,?,?,?,?)",
			       50) ) goto Error_SqlCall_close;


	/* exec sql begin transaction; */

	printf("TPCC Data Load Started...\n");

	if(particle_flg==0){
	    LoadItems();
	    LoadWare();
	    LoadCust();
	    LoadOrd();
	}else if(particle_flg==1){
	    switch(part_no){
		case 1:
		    LoadItems();
		    break;
		case 2:
		    LoadWare();
		    break;
		case 3:
		    LoadCust();
		    break;
		case 4:
		    LoadOrd();
		    break;
		default:
		    printf("Unknown part_no\n");
		    printf("1:ITEMS 2:WAREHOUSE 3:CUSTOMER 4:ORDERS\n");
	    }
	}

	/* EXEC SQL COMMIT WORK; */

	if( mysql_commit(mysql) ) goto Error_SqlCall;

	for( i=0; i<11; i++ ){
	    mysql_stmt_close(stmt[i]);
	}

	/* EXEC SQL DISCONNECT; */

	mysql_close(mysql);

	printf("\n...DATA LOADING COMPLETED SUCCESSFULLY.\n");
	exit(0);
Error_SqlCall_close:
Error_SqlCall:
	Error(0);
}

/*
 * ==================================================================+ |
 * ROUTINE NAME |      LoadItems | DESCRIPTION |      Loads the Item table |
 * ARGUMENTS |      none
 * +==================================================================
 */
void 
LoadItems()
{

	int             i_id;
	int             i_im_id;
        char            i_name[25];
	float           i_price;
	char            i_data[51];

	int             idatasiz;
	int             orig[MAXITEMS+1];
	int             pos;
	int             i;
    int             retried = 0;

	MYSQL_BIND    param[5];

	/* EXEC SQL WHENEVER SQLERROR GOTO sqlerr; */

	printf("Loading Item \n");

	for (i = 0; i < MAXITEMS / 10; i++)
		orig[i] = 0;
	for (i = 0; i < MAXITEMS / 10; i++) {
		do {
			pos = RandomNumber(0L, MAXITEMS);
		} while (orig[pos]);
		orig[pos] = 1;
	}
retry:
    if (retried)
        printf("Retrying ...\n");
    retried = 1;
	for (i_id = 1; i_id <= MAXITEMS; i_id++) {

		/* Generate Item Data */
		i_im_id = RandomNumber(1L, 10000L);

                i_name[ MakeAlphaString(14, 24, i_name) ] = 0;

		i_price = ((int) RandomNumber(100L, 10000L)) / 100.0;

		idatasiz = MakeAlphaString(26, 50, i_data);
		i_data[idatasiz] = 0;

		if (orig[i_id]) {
			pos = RandomNumber(0L, idatasiz - 8);
			i_data[pos] = 'o';
			i_data[pos + 1] = 'r';
			i_data[pos + 2] = 'i';
			i_data[pos + 3] = 'g';
			i_data[pos + 4] = 'i';
			i_data[pos + 5] = 'n';
			i_data[pos + 6] = 'a';
			i_data[pos + 7] = 'l';
		}
		if (option_debug)
			printf("IID = %ld, Name= %16s, Price = %5.2f\n",
			       i_id, i_name, i_price);

#if 0
		printf("about to exec sql\n");
		fflush(stdout);
#endif

		/* EXEC SQL INSERT INTO
		                item
		                values(:i_id,:i_im_id,:i_name,:i_price,:i_data); */

		memset(param, 0, sizeof(MYSQL_BIND) * 5); /* initialize */
		param[0].buffer_type = MYSQL_TYPE_LONG;
		param[0].buffer = &i_id;
		param[1].buffer_type = MYSQL_TYPE_LONG;
		param[1].buffer = &i_im_id;
		param[2].buffer_type = MYSQL_TYPE_STRING;
		param[2].buffer = i_name;
		param[2].buffer_length = strlen(i_name);
		param[3].buffer_type = MYSQL_TYPE_FLOAT;
		param[3].buffer = &i_price;
		param[4].buffer_type = MYSQL_TYPE_STRING;
		param[4].buffer = i_data;
		param[4].buffer_length = strlen(i_data);
		if( mysql_stmt_bind_param(stmt[0], param) ) goto sqlerr;
		if( try_stmt_execute(stmt[0]) ) goto retry;

#if 0
		printf("done executing sql\n");
		fflush(stdout);
#endif

		if (!(i_id % 100)) {
			printf(".");
			fflush(stdout);

			if (!(i_id % 5000))
				printf(" %ld\n", i_id);
		}
	}

	/* EXEC SQL COMMIT WORK; */
	if( mysql_commit(mysql) ) goto sqlerr;

	printf("Item Done. \n");
	return;
sqlerr:
	Error(stmt[0]);
}

/*
 * ==================================================================+ |
 * ROUTINE NAME |      LoadWare | DESCRIPTION |      Loads the Warehouse
 * table |      Loads Stock, District as Warehouses are created | ARGUMENTS |
 * none +==================================================================
 */
void 
LoadWare()
{

	int             w_id;
        char            w_name[11];
        char            w_street_1[21];
        char            w_street_2[21];
        char            w_city[21];
        char            w_state[3];
        char            w_zip[10];
	float           w_tax;
	float           w_ytd;

	int             tmp;
    int             retried = 0;

	MYSQL_BIND    param[9];

	/* EXEC SQL WHENEVER SQLERROR GOTO sqlerr; */

	printf("Loading Warehouse \n");
    w_id = min_ware;
retry:
    if (retried)
        printf("Retrying ....\n");
    retried = 1;
	for (; w_id <= max_ware; w_id++) {

		/* Generate Warehouse Data */

                w_name[ MakeAlphaString(6, 10, w_name) ] = 0;

		MakeAddress(w_street_1, w_street_2, w_city, w_state, w_zip);

		w_tax = ((float) RandomNumber(10L, 20L)) / 100.0;
		w_ytd = 300000.00;

		if (option_debug)
			printf("WID = %ld, Name= %16s, Tax = %5.2f\n",
			       w_id, w_name, w_tax);

		/*EXEC SQL INSERT INTO
		                warehouse
		                values(:w_id,:w_name,
				       :w_street_1,:w_street_2,:w_city,:w_state,
				       :w_zip,:w_tax,:w_ytd);*/

		memset(param, 0, sizeof(MYSQL_BIND) * 9); /* initialize */
		param[0].buffer_type = MYSQL_TYPE_LONG;
		param[0].buffer = &w_id;
		param[1].buffer_type = MYSQL_TYPE_STRING;
		param[1].buffer = w_name;
		param[1].buffer_length = strlen(w_name);
		param[2].buffer_type = MYSQL_TYPE_STRING;
		param[2].buffer = w_street_1;
		param[2].buffer_length = strlen(w_street_1);
		param[3].buffer_type = MYSQL_TYPE_STRING;
		param[3].buffer = w_street_2;
		param[3].buffer_length = strlen(w_street_2);
		param[4].buffer_type = MYSQL_TYPE_STRING;
		param[4].buffer = w_city;
		param[4].buffer_length = strlen(w_city);
		param[5].buffer_type = MYSQL_TYPE_STRING;
		param[5].buffer = w_state;
		param[5].buffer_length = strlen(w_state);
		param[6].buffer_type = MYSQL_TYPE_STRING;
		param[6].buffer = w_zip;
		param[6].buffer_length = strlen(w_zip);
		param[7].buffer_type = MYSQL_TYPE_FLOAT;
		param[7].buffer = &w_tax;
		param[8].buffer_type = MYSQL_TYPE_FLOAT;
		param[8].buffer = &w_ytd;
		if( mysql_stmt_bind_param(stmt[1], param) ) goto sqlerr;
		if( try_stmt_execute(stmt[1]) ) goto retry;

		/** Make Rows associated with Warehouse **/
		if( Stock(w_id) ) goto retry;
		if( District(w_id) ) goto retry;

		/* EXEC SQL COMMIT WORK; */
		if( mysql_commit(mysql) ) goto sqlerr;

	}

	return;
sqlerr:
	Error(0);
}

/*
 * ==================================================================+ |
 * ROUTINE NAME |      LoadCust | DESCRIPTION |      Loads the Customer Table
 * | ARGUMENTS |      none
 * +==================================================================
 */
void 
LoadCust()
{

	int             w_id;
	int             d_id;

	/* EXEC SQL WHENEVER SQLERROR GOTO sqlerr; */

	for (w_id = min_ware; w_id <= max_ware; w_id++)
		for (d_id = 1L; d_id <= DIST_PER_WARE; d_id++)
			Customer(d_id, w_id);

	/* EXEC SQL COMMIT WORK;*/	/* Just in case */
	if( mysql_commit(mysql) ) goto sqlerr;

	return;
sqlerr:
	Error(0);
}

/*
 * ==================================================================+ |
 * ROUTINE NAME |      LoadOrd | DESCRIPTION |      Loads the Orders and
 * Order_Line Tables | ARGUMENTS |      none
 * +==================================================================
 */
void 
LoadOrd()
{

	int             w_id;
	float           w_tax;
	int             d_id;
	float           d_tax;

	/* EXEC SQL WHENEVER SQLERROR GOTO sqlerr;*/

	for (w_id = min_ware; w_id <= max_ware; w_id++)
		for (d_id = 1L; d_id <= DIST_PER_WARE; d_id++)
			Orders(d_id, w_id);

	/* EXEC SQL COMMIT WORK; */	/* Just in case */
	if( mysql_commit(mysql) ) goto sqlerr;

	return;
sqlerr:
	Error(0);
}

/*
 * ==================================================================+ |
 * ROUTINE NAME |      Stock | DESCRIPTION |      Loads the Stock table |
 * ARGUMENTS |      w_id - warehouse id
 * +==================================================================
 */
int 
Stock(w_id)
	int             w_id;
{

	int             s_i_id;
	int             s_w_id;
	int             s_quantity;

	char            s_dist_01[25];
	char            s_dist_02[25];
	char            s_dist_03[25];
	char            s_dist_04[25];
	char            s_dist_05[25];
	char            s_dist_06[25];
	char            s_dist_07[25];
	char            s_dist_08[25];
	char            s_dist_09[25];
	char            s_dist_10[25];
	char            s_data[51];

	int             sdatasiz;
	int             orig[MAXITEMS+1];
	int             pos;
	int             i;
    int             error;

	MYSQL_BIND    param[14];

	/* EXEC SQL WHENEVER SQLERROR GOTO sqlerr;*/
	printf("Loading Stock Wid=%ld\n", w_id);
	s_w_id = w_id;

	for (i = 0; i < MAXITEMS / 10; i++)
		orig[i] = 0;
	for (i = 0; i < MAXITEMS / 10; i++) {
		do {
			pos = RandomNumber(0L, MAXITEMS);
		} while (orig[pos]);
		orig[pos] = 1;
	}

retry:
	for (s_i_id = 1; s_i_id <= MAXITEMS; s_i_id++) {

		/* Generate Stock Data */
		s_quantity = RandomNumber(10L, 100L);

		s_dist_01[ MakeAlphaString(24, 24, s_dist_01) ] = 0;
		s_dist_02[ MakeAlphaString(24, 24, s_dist_02) ] = 0;
		s_dist_03[ MakeAlphaString(24, 24, s_dist_03) ] = 0;
		s_dist_04[ MakeAlphaString(24, 24, s_dist_04) ] = 0;
		s_dist_05[ MakeAlphaString(24, 24, s_dist_05) ] = 0;
		s_dist_06[ MakeAlphaString(24, 24, s_dist_06) ] = 0;
		s_dist_07[ MakeAlphaString(24, 24, s_dist_07) ] = 0;
		s_dist_08[ MakeAlphaString(24, 24, s_dist_08) ] = 0;
		s_dist_09[ MakeAlphaString(24, 24, s_dist_09) ] = 0;
		s_dist_10[ MakeAlphaString(24, 24, s_dist_10) ] = 0;
		sdatasiz = MakeAlphaString(26, 50, s_data);
		s_data[sdatasiz] = 0;

		if (orig[s_i_id]) {
			pos = RandomNumber(0L, sdatasiz - 8);

			s_data[pos] = 'o';
			s_data[pos + 1] = 'r';
			s_data[pos + 2] = 'i';
			s_data[pos + 3] = 'g';
			s_data[pos + 4] = 'i';
			s_data[pos + 5] = 'n';
			s_data[pos + 6] = 'a';
			s_data[pos + 7] = 'l';

		}
		/*EXEC SQL INSERT INTO
		                stock
		                values(:s_i_id,:s_w_id,:s_quantity,
				       :s_dist_01,:s_dist_02,:s_dist_03,:s_dist_04,:s_dist_05,
				       :s_dist_06,:s_dist_07,:s_dist_08,:s_dist_09,:s_dist_10,
				       0, 0, 0,:s_data);*/

		memset(param, 0, sizeof(MYSQL_BIND) * 14); /* initialize */
		param[0].buffer_type = MYSQL_TYPE_LONG;
		param[0].buffer = &s_i_id;
		param[1].buffer_type = MYSQL_TYPE_LONG;
		param[1].buffer = &s_w_id;
		param[2].buffer_type = MYSQL_TYPE_LONG;
		param[2].buffer = &s_quantity;
		param[3].buffer_type = MYSQL_TYPE_STRING;
		param[3].buffer = s_dist_01;
		param[3].buffer_length = strlen(s_dist_01);
		param[4].buffer_type = MYSQL_TYPE_STRING;
		param[4].buffer = s_dist_02;
		param[4].buffer_length = strlen(s_dist_02);
		param[5].buffer_type = MYSQL_TYPE_STRING;
		param[5].buffer = s_dist_03;
		param[5].buffer_length = strlen(s_dist_03);
		param[6].buffer_type = MYSQL_TYPE_STRING;
		param[6].buffer = s_dist_04;
		param[6].buffer_length = strlen(s_dist_04);
		param[7].buffer_type = MYSQL_TYPE_STRING;
		param[7].buffer = s_dist_05;
		param[7].buffer_length = strlen(s_dist_05);
		param[8].buffer_type = MYSQL_TYPE_STRING;
		param[8].buffer = s_dist_06;
		param[8].buffer_length = strlen(s_dist_06);
		param[9].buffer_type = MYSQL_TYPE_STRING;
		param[9].buffer = s_dist_07;
		param[9].buffer_length = strlen(s_dist_07);
		param[10].buffer_type = MYSQL_TYPE_STRING;
		param[10].buffer = s_dist_08;
		param[10].buffer_length = strlen(s_dist_08);
		param[11].buffer_type = MYSQL_TYPE_STRING;
		param[11].buffer = s_dist_09;
		param[11].buffer_length = strlen(s_dist_09);
		param[12].buffer_type = MYSQL_TYPE_STRING;
		param[12].buffer = s_dist_10;
		param[12].buffer_length = strlen(s_dist_10);
		param[13].buffer_type = MYSQL_TYPE_STRING;
		param[13].buffer = s_data;
		param[13].buffer_length = strlen(s_data);
		if( mysql_stmt_bind_param(stmt[2], param) ) goto sqlerr;
		if( (error = try_stmt_execute(stmt[2])) ) goto out;

		if (option_debug)
			printf("SID = %ld, WID = %ld, Quan = %ld\n",
			       s_i_id, s_w_id, s_quantity);

		if (!(s_i_id % 100)) {
			printf(".");
			fflush(stdout);
			if (!(s_i_id % 5000))
				printf(" %ld\n", s_i_id);
		}
	}

	printf(" Stock Done.\n");
out:
	return error;
sqlerr:
    Error(0);
}

/*
 * ==================================================================+ |
 * ROUTINE NAME |      District | DESCRIPTION |      Loads the District table
 * | ARGUMENTS |      w_id - warehouse id
 * +==================================================================
 */
int 
District(w_id)
	int             w_id;
{

	int             d_id;
	int             d_w_id;

	char            d_name[11];
	char            d_street_1[21];
	char            d_street_2[21];
	char            d_city[21];
	char            d_state[3];
	char            d_zip[10];

	float           d_tax;
	float           d_ytd;
	int             d_next_o_id;
    int             error;

	MYSQL_BIND    param[11];

	/* EXEC SQL WHENEVER SQLERROR GOTO sqlerr;*/

	printf("Loading District\n");
	d_w_id = w_id;
	d_ytd = 30000.0;
	d_next_o_id = 3001L;
retry:
	for (d_id = 1; d_id <= DIST_PER_WARE; d_id++) {

		/* Generate District Data */

		d_name[ MakeAlphaString(6L, 10L, d_name) ] = 0;
		MakeAddress(d_street_1, d_street_2, d_city, d_state, d_zip);

		d_tax = ((float) RandomNumber(10L, 20L)) / 100.0;

		/*EXEC SQL INSERT INTO
		                district
		                values(:d_id,:d_w_id,:d_name,
				       :d_street_1,:d_street_2,:d_city,:d_state,:d_zip,
				       :d_tax,:d_ytd,:d_next_o_id);*/

		memset(param, 0, sizeof(MYSQL_BIND) * 11); /* initialize */
		param[0].buffer_type = MYSQL_TYPE_LONG;
		param[0].buffer = &d_id;
		param[1].buffer_type = MYSQL_TYPE_LONG;
		param[1].buffer = &d_w_id;
		param[2].buffer_type = MYSQL_TYPE_STRING;
		param[2].buffer = d_name;
		param[2].buffer_length = strlen(d_name);
		param[3].buffer_type = MYSQL_TYPE_STRING;
		param[3].buffer = d_street_1;
		param[3].buffer_length = strlen(d_street_1);
		param[4].buffer_type = MYSQL_TYPE_STRING;
		param[4].buffer = d_street_2;
		param[4].buffer_length = strlen(d_street_2);
		param[5].buffer_type = MYSQL_TYPE_STRING;
		param[5].buffer = d_city;
		param[5].buffer_length = strlen(d_city);
		param[6].buffer_type = MYSQL_TYPE_STRING;
		param[6].buffer = d_state;
		param[6].buffer_length = strlen(d_state);
		param[7].buffer_type = MYSQL_TYPE_STRING;
		param[7].buffer = d_zip;
		param[7].buffer_length = strlen(d_zip);
		param[8].buffer_type = MYSQL_TYPE_FLOAT;
		param[8].buffer = &d_tax;
		param[9].buffer_type = MYSQL_TYPE_FLOAT;
		param[9].buffer = &d_ytd;
		param[10].buffer_type = MYSQL_TYPE_LONG;
		param[10].buffer = &d_next_o_id;
		if( mysql_stmt_bind_param(stmt[3], param) ) goto sqlerr;
		if( (error = try_stmt_execute(stmt[3])) ) goto out;

		if (option_debug)
			printf("DID = %ld, WID = %ld, Name = %10s, Tax = %5.2f\n",
			       d_id, d_w_id, d_name, d_tax);

	}

out:
	return error;
sqlerr:
	Error(0);
}

/*
 * ==================================================================+ |
 * ROUTINE NAME |      Customer | DESCRIPTION |      Loads Customer Table |
 * Also inserts corresponding history record | ARGUMENTS |      id   -
 * customer id |      d_id - district id |      w_id - warehouse id
 * +==================================================================
 */
void 
Customer(d_id, w_id)
	int             d_id;
	int             w_id;
{
	int             c_id;
	int             c_d_id;
	int             c_w_id;

	char            c_first[17];
	char            c_middle[3];
	char            c_last[17];
	char            c_street_1[21];
	char            c_street_2[21];
	char            c_city[21];
	char            c_state[3];
	char            c_zip[10];
	char            c_phone[17];
	char            c_since[12];
	char            c_credit[3];

	int             c_credit_lim;
	float           c_discount;
	float           c_balance;
	char            c_data[501];

	float           h_amount;

	char            h_data[25];
    int             retried = 0;

	MYSQL_BIND    param[18];

	/*EXEC SQL WHENEVER SQLERROR GOTO sqlerr;*/

	printf("Loading Customer for DID=%ld, WID=%ld\n", d_id, w_id);

retry:
    if (retried)
        printf("Retrying ...\n");
    retried = 1;
	for (c_id = 1; c_id <= CUST_PER_DIST; c_id++) {

		/* Generate Customer Data */
		c_d_id = d_id;
		c_w_id = w_id;

		c_first[ MakeAlphaString(8, 16, c_first) ] = 0;
		c_middle[0] = 'O';
		c_middle[1] = 'E';
		c_middle[2] = 0;

		if (c_id <= 1000) {
			Lastname(c_id - 1, c_last);
		} else {
			Lastname(NURand(255, 0, 999), c_last);
		}

		MakeAddress(c_street_1, c_street_2, c_city, c_state, c_zip);
		c_phone[ MakeNumberString(16, 16, c_phone) ] = 0;

		if (RandomNumber(0L, 1L))
			c_credit[0] = 'G';
		else
			c_credit[0] = 'B';
		c_credit[1] = 'C';
		c_credit[2] = 0;

		c_credit_lim = 50000;
		c_discount = ((float) RandomNumber(0L, 50L)) / 100.0;
		c_balance = -10.0;

		c_data[ MakeAlphaString(300, 500, c_data) ] = 0;

		/*EXEC SQL INSERT INTO
		                customer
		                values(:c_id,:c_d_id,:c_w_id,
				  :c_first,:c_middle,:c_last,
				  :c_street_1,:c_street_2,:c_city,:c_state,
				  :c_zip,
			          :c_phone, :timestamp,
				  :c_credit,
				  :c_credit_lim,:c_discount,:c_balance,
				  10.0, 1, 0,:c_data);*/

		memset(param, 0, sizeof(MYSQL_BIND) * 18); /* initialize */
		param[0].buffer_type = MYSQL_TYPE_LONG;
		param[0].buffer = &c_id;
		param[1].buffer_type = MYSQL_TYPE_LONG;
		param[1].buffer = &c_d_id;
		param[2].buffer_type = MYSQL_TYPE_LONG;
		param[2].buffer = &c_w_id;
		param[3].buffer_type = MYSQL_TYPE_STRING;
		param[3].buffer = c_first;
		param[3].buffer_length = strlen(c_first);
		param[4].buffer_type = MYSQL_TYPE_STRING;
		param[4].buffer = c_middle;
		param[4].buffer_length = strlen(c_middle);
		param[5].buffer_type = MYSQL_TYPE_STRING;
		param[5].buffer = c_last;
		param[5].buffer_length = strlen(c_last);
		param[6].buffer_type = MYSQL_TYPE_STRING;
		param[6].buffer = c_street_1;
		param[6].buffer_length = strlen(c_street_1);
		param[7].buffer_type = MYSQL_TYPE_STRING;
		param[7].buffer = c_street_2;
		param[7].buffer_length = strlen(c_street_2);
		param[8].buffer_type = MYSQL_TYPE_STRING;
		param[8].buffer = c_city;
		param[8].buffer_length = strlen(c_city);
		param[9].buffer_type = MYSQL_TYPE_STRING;
		param[9].buffer = c_state;
		param[9].buffer_length = strlen(c_state);
		param[10].buffer_type = MYSQL_TYPE_STRING;
		param[10].buffer = c_zip;
		param[10].buffer_length = strlen(c_zip);
		param[11].buffer_type = MYSQL_TYPE_STRING;
		param[11].buffer = c_phone;
		param[11].buffer_length = strlen(c_phone);
		param[12].buffer_type = MYSQL_TYPE_STRING;
		param[12].buffer = timestamp;
		param[12].buffer_length = strlen(timestamp);
		param[13].buffer_type = MYSQL_TYPE_STRING;
		param[13].buffer = c_credit;
		param[13].buffer_length = strlen(c_credit);
		param[14].buffer_type = MYSQL_TYPE_LONG;
		param[14].buffer = &c_credit_lim;
		param[15].buffer_type = MYSQL_TYPE_FLOAT;
		param[15].buffer = &c_discount;
		param[16].buffer_type = MYSQL_TYPE_FLOAT;
		param[16].buffer = &c_balance;
		param[17].buffer_type = MYSQL_TYPE_STRING;
		param[17].buffer = c_data;
		param[17].buffer_length = strlen(c_data);
		if( mysql_stmt_bind_param(stmt[4], param) ) goto sqlerr;
		if( try_stmt_execute(stmt[4]) ) goto retry;

		h_amount = 10.0;

		h_data[ MakeAlphaString(12, 24, h_data) ] = 0;

		/*EXEC SQL INSERT INTO
		                history
		                values(:c_id,:c_d_id,:c_w_id,
				       :c_d_id,:c_w_id, :timestamp,
				       :h_amount,:h_data);*/

		memset(param, 0, sizeof(MYSQL_BIND) * 8); /* initialize */
		param[0].buffer_type = MYSQL_TYPE_LONG;
		param[0].buffer = &c_id;
		param[1].buffer_type = MYSQL_TYPE_LONG;
		param[1].buffer = &c_d_id;
		param[2].buffer_type = MYSQL_TYPE_LONG;
		param[2].buffer = &c_w_id;
		param[3].buffer_type = MYSQL_TYPE_LONG;
		param[3].buffer = &c_d_id;
		param[4].buffer_type = MYSQL_TYPE_LONG;
		param[4].buffer = &c_w_id;
		param[5].buffer_type = MYSQL_TYPE_STRING;
		param[5].buffer = timestamp;
		param[5].buffer_length = strlen(timestamp);
		param[6].buffer_type = MYSQL_TYPE_FLOAT;
		param[6].buffer = &h_amount;
		param[7].buffer_type = MYSQL_TYPE_STRING;
		param[7].buffer = h_data;
		param[7].buffer_length = strlen(h_data);
		if( mysql_stmt_bind_param(stmt[5], param) ) goto sqlerr;
		if( try_stmt_execute(stmt[5]) ) goto retry;

		if (option_debug)
			printf("CID = %ld, LST = %s, P# = %s\n",
			       c_id, c_last, c_phone);
		if (!(c_id % 100)) {
 			printf(".");
			fflush(stdout);
			if (!(c_id % 1000))
				printf(" %ld\n", c_id);
		}
	}
	/* EXEC SQL COMMIT WORK; */
	if( mysql_commit(mysql) ) goto sqlerr;
	printf("Customer Done.\n");

	return;
sqlerr:
	Error(0);
}

/*
 * ==================================================================+ |
 * ROUTINE NAME |      Orders | DESCRIPTION |      Loads the Orders table |
 * Also loads the Order_Line table on the fly | ARGUMENTS |      w_id -
 * warehouse id
 * +==================================================================
 */
void 
Orders(d_id, w_id)
	int             d_id, w_id;
{

	int             o_id;
	int             o_c_id;
	int             o_d_id;
	int             o_w_id;
	int             o_carrier_id;
	int             o_ol_cnt;
	int             ol;
	int             ol_i_id;
	int             ol_supply_w_id;
	int             ol_quantity;
	float           ol_amount;
	char            ol_dist_info[25];
	float           i_price;
	float           c_discount;
	float           tmp_float;
    int             retried = 0;

	MYSQL_BIND    param[10];

	/* EXEC SQL WHENEVER SQLERROR GOTO sqlerr; */

	printf("Loading Orders for D=%ld, W= %ld\n", d_id, w_id);
	o_d_id = d_id;
	o_w_id = w_id;
retry:
    if (retried)
        printf("Retrying ...\n");
    retried = 1;
	InitPermutation();	/* initialize permutation of customer numbers */
	for (o_id = 1; o_id <= ORD_PER_DIST; o_id++) {

		/* Generate Order Data */
		o_c_id = GetPermutation();
		o_carrier_id = RandomNumber(1L, 10L);
		o_ol_cnt = RandomNumber(5L, 15L);

		if (o_id > 2100) {	/* the last 900 orders have not been
					 * delivered) */
		    /*EXEC SQL INSERT INTO
			                orders
			                values(:o_id,:o_d_id,:o_w_id,:o_c_id,
					       :timestamp,
					       NULL,:o_ol_cnt, 1);*/

		    memset(param, 0, sizeof(MYSQL_BIND) * 6); /* initialize */
		    param[0].buffer_type = MYSQL_TYPE_LONG;
		    param[0].buffer = &o_id;
		    param[1].buffer_type = MYSQL_TYPE_LONG;
		    param[1].buffer = &o_d_id;
		    param[2].buffer_type = MYSQL_TYPE_LONG;
		    param[2].buffer = &o_w_id;
		    param[3].buffer_type = MYSQL_TYPE_LONG;
		    param[3].buffer = &o_c_id;
		    param[4].buffer_type = MYSQL_TYPE_STRING;
		    param[4].buffer = timestamp;
		    param[4].buffer_length = strlen(timestamp);
		    param[5].buffer_type = MYSQL_TYPE_LONG;
		    param[5].buffer = &o_ol_cnt;
		    if( mysql_stmt_bind_param(stmt[6], param) ) goto sqlerr;
		    if( try_stmt_execute(stmt[6]) ) goto retry;

		    /*EXEC SQL INSERT INTO
			                new_orders
			                values(:o_id,:o_d_id,:o_w_id);*/

		    memset(param, 0, sizeof(MYSQL_BIND) * 3); /* initialize */
		    param[0].buffer_type = MYSQL_TYPE_LONG;
		    param[0].buffer = &o_id;
		    param[1].buffer_type = MYSQL_TYPE_LONG;
		    param[1].buffer = &o_d_id;
		    param[2].buffer_type = MYSQL_TYPE_LONG;
		    param[2].buffer = &o_w_id;
		    if( mysql_stmt_bind_param(stmt[7], param) ) goto sqlerr;
		    if( try_stmt_execute(stmt[7]) ) goto retry;

		} else {
		    /*EXEC SQL INSERT INTO
			    orders
			    values(:o_id,:o_d_id,:o_w_id,:o_c_id,
				   :timestamp,
				   :o_carrier_id,:o_ol_cnt, 1);*/

		    memset(param, 0, sizeof(MYSQL_BIND) * 7); /* initialize */
		    param[0].buffer_type = MYSQL_TYPE_LONG;
		    param[0].buffer = &o_id;
		    param[1].buffer_type = MYSQL_TYPE_LONG;
		    param[1].buffer = &o_d_id;
		    param[2].buffer_type = MYSQL_TYPE_LONG;
		    param[2].buffer = &o_w_id;
		    param[3].buffer_type = MYSQL_TYPE_LONG;
		    param[3].buffer = &o_c_id;
		    param[4].buffer_type = MYSQL_TYPE_STRING;
		    param[4].buffer = timestamp;
		    param[4].buffer_length = strlen(timestamp);
		    param[5].buffer_type = MYSQL_TYPE_LONG;
		    param[5].buffer = &o_carrier_id;
		    param[6].buffer_type = MYSQL_TYPE_LONG;
		    param[6].buffer = &o_ol_cnt;
		    if( mysql_stmt_bind_param(stmt[8], param) ) goto sqlerr;
		    if( try_stmt_execute(stmt[8]) ) goto retry;

		}


		if (option_debug)
			printf("OID = %ld, CID = %ld, DID = %ld, WID = %ld\n",
			       o_id, o_c_id, o_d_id, o_w_id);

		for (ol = 1; ol <= o_ol_cnt; ol++) {
			/* Generate Order Line Data */
			ol_i_id = RandomNumber(1L, MAXITEMS);
			ol_supply_w_id = o_w_id;
			ol_quantity = 5;
			ol_amount = 0.0;

			ol_dist_info[ MakeAlphaString(24, 24, ol_dist_info) ] = 0;

			tmp_float = (float) (RandomNumber(10L, 10000L)) / 100.0;

			if (o_id > 2100) {
			    /*EXEC SQL INSERT INTO
				                order_line
				                values(:o_id,:o_d_id,:o_w_id,:ol,
						       :ol_i_id,:ol_supply_w_id, NULL,
						       :ol_quantity,:tmp_float,:ol_dist_info);*/

			    memset(param, 0, sizeof(MYSQL_BIND) * 9); /* initialize */
			    param[0].buffer_type = MYSQL_TYPE_LONG;
			    param[0].buffer = &o_id;
			    param[1].buffer_type = MYSQL_TYPE_LONG;
			    param[1].buffer = &o_d_id;
			    param[2].buffer_type = MYSQL_TYPE_LONG;
			    param[2].buffer = &o_w_id;
			    param[3].buffer_type = MYSQL_TYPE_LONG;
			    param[3].buffer = &ol;
			    param[4].buffer_type = MYSQL_TYPE_LONG;
			    param[4].buffer = &ol_i_id;
			    param[5].buffer_type = MYSQL_TYPE_LONG;
			    param[5].buffer = &ol_supply_w_id;
			    param[6].buffer_type = MYSQL_TYPE_LONG;
			    param[6].buffer = &ol_quantity;
			    param[7].buffer_type = MYSQL_TYPE_FLOAT;
			    param[7].buffer = &tmp_float;
			    param[8].buffer_type = MYSQL_TYPE_STRING;
			    param[8].buffer = ol_dist_info;
			    param[8].buffer_length = strlen(ol_dist_info);
			    if( mysql_stmt_bind_param(stmt[9], param) ) goto sqlerr;
			    if( try_stmt_execute(stmt[9]) ) goto retry;

			} else {
			    /*EXEC SQL INSERT INTO
				    order_line
				    values(:o_id,:o_d_id,:o_w_id,:ol,
					   :ol_i_id,:ol_supply_w_id, 
					   :timestamp,
					   :ol_quantity,:ol_amount,:ol_dist_info);*/

			    memset(param, 0, sizeof(MYSQL_BIND) * 10); /* initialize */
			    param[0].buffer_type = MYSQL_TYPE_LONG;
			    param[0].buffer = &o_id;
			    param[1].buffer_type = MYSQL_TYPE_LONG;
			    param[1].buffer = &o_d_id;
			    param[2].buffer_type = MYSQL_TYPE_LONG;
			    param[2].buffer = &o_w_id;
			    param[3].buffer_type = MYSQL_TYPE_LONG;
			    param[3].buffer = &ol;
			    param[4].buffer_type = MYSQL_TYPE_LONG;
			    param[4].buffer = &ol_i_id;
			    param[5].buffer_type = MYSQL_TYPE_LONG;
			    param[5].buffer = &ol_supply_w_id;
			    param[6].buffer_type = MYSQL_TYPE_STRING;
			    param[6].buffer = timestamp;
			    param[6].buffer_length = strlen(timestamp);
			    param[7].buffer_type = MYSQL_TYPE_LONG;
			    param[7].buffer = &ol_quantity;
			    param[8].buffer_type = MYSQL_TYPE_FLOAT;
			    param[8].buffer = &ol_amount;
			    param[9].buffer_type = MYSQL_TYPE_STRING;
			    param[9].buffer = ol_dist_info;
			    param[9].buffer_length = strlen(ol_dist_info);
			    if( mysql_stmt_bind_param(stmt[10], param) ) goto sqlerr;
			    if( try_stmt_execute(stmt[10]) ) goto retry;
			}

			if (option_debug)
				printf("OL = %ld, IID = %ld, QUAN = %ld, AMT = %8.2f\n",
				       ol, ol_i_id, ol_quantity, ol_amount);

		}
		if (!(o_id % 100)) {
			printf(".");
			fflush(stdout);

 			if (!(o_id % 1000))
				printf(" %ld\n", o_id);
		}
	}
	/*EXEC SQL COMMIT WORK;*/
	if( mysql_commit(mysql) ) goto sqlerr;

	printf("Orders Done.\n");
	return;
sqlerr:
	Error(0);
}

/*
 * ==================================================================+ |
 * ROUTINE NAME |      MakeAddress() | DESCRIPTION |      Build an Address |
 * ARGUMENTS
 * +==================================================================
 */
void 
MakeAddress(str1, str2, city, state, zip)
	char           *str1;
	char           *str2;
	char           *city;
	char           *state;
	char           *zip;
{
	str1[ MakeAlphaString(10, 20, str1) ] = 0;	/* Street 1 */
	str2[ MakeAlphaString(10, 20, str2) ] = 0;	/* Street 2 */
	city[ MakeAlphaString(10, 20, city) ] = 0;	/* City */
	state[ MakeAlphaString(2, 2, state) ] = 0;	/* State */
	zip[ MakeNumberString(9, 9, zip) ] = 0;	/* Zip */
}

/*
 * ==================================================================+ |
 * ROUTINE NAME |      Error() | DESCRIPTION |      Handles an error from a
 * SQL call. | ARGUMENTS
 * +==================================================================
 */
void 
Error(mysql_stmt)
        MYSQL_STMT   *mysql_stmt;
{
    if(mysql_stmt) {
	printf("\n%d, %s, %s", mysql_stmt_errno(mysql_stmt),
	       mysql_stmt_sqlstate(mysql_stmt), mysql_stmt_error(mysql_stmt) );
    }
    printf("\n%d, %s, %s\n", mysql_errno(mysql), mysql_sqlstate(mysql), mysql_error(mysql) );

    /*EXEC SQL WHENEVER SQLERROR CONTINUE;*/

    /*EXEC SQL ROLLBACK WORK;*/
    mysql_rollback(mysql);

    /*EXEC SQL DISCONNECT;*/
    mysql_close(mysql);

	exit(-1);
}
