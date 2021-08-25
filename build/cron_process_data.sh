#!/bin/bash
export WEB_APPLICATION_TYPE=NONE && spring_profiles_active=prod && java -jar /mnt/covid19/backend/bin/backend-0.0.1-SNAPSHOT.jar importdata
