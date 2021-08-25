#https://www.kinamo.be/en/support/faq/mysql-automatic-backup-of-database
#vi /etc/crontab
#0 1 * * * root /home/ubuntu/build/back_up_db.sh
#service cron restart
#zcat guoyi5d.sql.gz

#!/bin/bash

# Basic configuration: datestamp e.g. YYYYMMDD

DATE=$(date +"%Y%m%d")

# Location of your backups (create the directory first!)

BACKUP_DIR="/home/ubuntu/build/backups"

# MySQL login details

MYSQL_USER="guoyi5d"
MYSQL_PASSWORD="guoyi5d"

# MySQL executable locations (no need to change this)


# MySQL databases you wish to skip

SKIPDATABASES="Database|information_schema|performance_schema|mysql"

# Number of days to keep the directories (older than X days will be removed)

RETENTION=14

# ---- DO NOT CHANGE BELOW THIS LINE ------------------------------------------
#
# Create a new directory into backup directory location for this date

mkdir -p $BACKUP_DIR/$DATE

# Retrieve a list of all databases

# Dumb the databases in seperate names and gzip the .sql file

mysqldump --force --opt --user=$MYSQL_USER -p$MYSQL_PASSWORD --databases guoyi5d | gzip > "$BACKUP_DIR/$DATE/guoyi5d.sql.gz"

# Remove files older than X days

find $BACKUP_DIR/* -mtime +$RETENTION -delete
