# PVMS Project

## Status
   Client side : `Prototype`.

   Server side : `Completed`.

## Reqirements
   [NodeJs](https://nodejs.org/en/) : `^19.0.0`.

## Download Project
```
git clone https://github.com/techaploog/pvms-project.git
```
or download a [zip file](https://github.com/techaploog/pvms-project/archive/refs/heads/main.zip)

## Important !!
Make sure to set all of these ENVIRONEMENT variables.
```
# for client
# data generater side
PVMS_SRC_URL=""
PVMS_DESC_IP=""
PVMS_DESC_PORT=""
PVMS_LOCAL_PORT=""

# for server
# data listener side
PVMS_SERV_PORT=""
PVMS_SERV_TP_LIST="" #"TP1,TP2,TP3"
PVMS_SERV_DB_FILE=""

# for API server
PVMS_API_PORT=""
```

## Start Client Guide
```
cd pvms-project
npm install
npm run client
```

## Start Server 
```
npm run server
```
