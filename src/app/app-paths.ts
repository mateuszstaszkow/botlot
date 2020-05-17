/* tslint:disable:max-line-length */

export const CHOPIN_BODY = [null, [[76.41934825983552, 139.5465543889834], [-22.491412363792442, -110.7659456110166]], [], [null, null, 1, null, null, 1, [1], null, null, null, null, null, null, [[[[['WAW', 0]]], null, [16], 0, [], [], '2020-03-13', [360], []], [null, [[['WAW', 0]]], [12], 0, [], [], '2020-03-15', [360], []]], null, null, null, true], null, 1];
export const WARSAW_BODY = [null, [[77.23040204073588, 138.8406804442027], [-19.165137143911153, -111.47181955579737]], [], [null, null, 1, null, null, 1, [1], null, null, null, null, null, null, [[[[['/m/081m_', 4]]], null, [16], 0, [], [], '2020-03-13', [360], []], [null, [[['/m/081m_', 4]]], [12], 0, [], [], '2020-03-15', [360], []]], null, null, null, true], null, 1];
export const GDANSK_BODY = [null, [[79.71547567273853, 123.61006707315732], [-7.031069335573834, -126.70243292684256]], [], [null, null, 1, null, null, 1, [1], null, null, null, null, null, null, [[[[['/m/035m6', 4]]], null, [16], 0, [], [], '2020-03-13', [360], []], [null, [[['/m/035m6', 4]]], [12], 0, [], [], '2020-03-15', [360], []]], null, null, null, true], null, 1];
export const HOLIDAY_BODY = [null, [[40, -135], [-40, -134]], [], [null, null, 1, null, null, 1, [1], null, null, null, null, null, null, [[[[['/m/081m_', 4]]], null, null, 0, [], [], '2020-03-20', [1500], []], [null, [[['/m/081m_', 4]]], null, 0, [], [], '2020-03-29', [1500], []]], null, null, null, true], null, 1];

export const TRIVAGO_ALL_INCUSIVE = ',1322/105:1,9/132:1,658/300:1,86/300:1,254/300:1,1324/106:1';
export const TRIVAGO_5_STAR_BEACH = ',1322/105:1,9/132:1,1527/106:1';
export const TRIVAGO_5_STAR = ',1322/105:1,2555/106:1';
export const TRIVAGO_LOW_COST = ',1322/105:1,1320/105:1,1318/105:1,2555/106:1';

export const GOOGLE_FLIGHTS_URL = 'https://flights-pa.clients6.google.com/$rpc/travel.frontend.flights.FlightsFrontendService/GetExploreDestinations';
export const TRIVAGO_GRAPHQL_URL = 'https://cdn-hs-graphql-dus.trivago.com/graphql';
export const TRIVAGO_SUGGESTIONS_URL = 'https://hsg-prod-eu.nsp.trv.cloud/api/mvp/suggestions';

export const GOOGLE_FLIGHTS_OPTIONS: RequestInit = {
  'credentials': 'omit',
  'headers': {
    'accept': '*/*',
    'accept-language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/json+protobuf',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'x-goog-api-key': 'AIzaSyBSuiOWj4xTH9RtdV1Np-pwYPyfGniSEOE',
    'x-goog-upload-command': '["en","EN","PLN",1,null,[-60]]',
    'x-goog-upload-protocol': '["!MzClMBFC_JO5L4rs2HtYqTwix9Ww6G4CAAAAdFIAAAAkmQNL9wpZui-ZBLct7PMbiER3aQSrE29mhvFEVd712tMqdPsRvV6AxBZ2L0A_TU2jlNYPFdGXyGNxgbeT2a3pZcw1hHbExYux-ctfeE2jsWmc8-OgnPEMUtP4sisFqXinQA1B3hBLaVKEejH5GiQ71X9biU2txZLJLC4XUPK7XG7AqvrJGyDtfno9F74TXMJL_Hy6vjnoY7zWdxujNaws2WAijcADtqulWUhvrnrm1UisL1uR8y-JD-t8i-uIuIGvYaDtRpcadrCLcza50EAACZ2eqERWxTzDo9UUbtI8kViu48vvvR9btfEHyjVURZHNs-O5uwGYo-tRlUAZ8TZL_nMCQPj40WlWHTdUTiA8mxMW3t75s_XuRyAn3_j0XjuBVSziXbiA93d2SWxw5LL0oy8YjbwIFu38CRL8hlOSSwPMTKCVUCnkv2dJAP52i9n9BPoRmzOkUL2YgyM9xIg5CPiieETE8o10qJGphYEkteC09yEmTb45E2gTGu2RN1RrA6E2qwdkXwi9VmNlHBjX6SDsCdwpGVQrJS2ilLq1yxBhUnxLQsjxDCaluFtgbDRtSHnQCMs4BW0bL4iYTBxrBnc-MBYpDqEP9AzHrsoNjXUroRt_ds9YyREUWb-OPeVRBObrzoZrHaAZo470kD6Oms5-A8fzb30izFb07t45650WPvLUX3Pp-F_hOREMZwL-KVQq_QXVPBapUWTJAlfV6L6R7_UxH6MUZbSOipYiAfQc6DIYxXbUVkJrrCUdA1bD0pEx5BpNPMjwkbNcE7EEsn-XPAAr_3gJD3qDsnI1rOhz1bxZfwnRYpMOuLdDN2_NaB_ZF3W1dc9_t9PSwO1_kc8FlvzdOe1iVKZXEwrttgCP79HKKbn6VCKs_zhyNPmmijNw6arJo92n_BdSJpoS5KQP-6KIJ4kxoLE_mCp-rh3i7-G5_o6jDgBBgKn2OGVRDL5wtWAfJrTEpxXvSGLABftrjPL-RfGpUapHAx994ri3qVqVHzpl2KPcEY9jCg9F-MIxo7eb8useODRhOlbJm38bDsGq5mqMnDuP1NxV_M-QdPHC7Ih9q1I9QpJgBVX-xp9SHB0zK1F5N2tZ6FXpIDR1fM6cQ-OOO0t9hBF6",null,null,39,null,null,null,0,"1"]',
    'x-user-agent': 'grpc-web-javascript/0.1'
  },
  'referrer': 'https://www.google.com/',
  'referrerPolicy': <any>'origin',
  'body': '',
  'method': 'POST',
  'mode': 'cors'
};
export const TRIVAGO_HOLIDAY_QUERY_PARAMS = {
  'tz': -60,
  'pra': '',
  'channel': 'b,isd:0',
  'csid': 6,
  'ccid': 'XioflSz5TVK58KfEesTVfwAAADU',
  'adl': 3,
  'crcl': '98.831276/8.018303,20000',
  's': '1',
  'uiv': '85523/200:1,1322/105:1,9/132:1,1527/106:1',
  'tid': 'pBr9lypiYIJpKHvilusVtRmUy_',
  'sp': '20201107/20201115',
  'rms': '3',
  'p': 'pl',
  'l': 'pl',
  'ccy': 'PLN',
  'accoff': 0,
  'acclim': 25
};
export const TRIVAGO_QUERY_PARAMS = {
  'tz': -60,
  'pra': '',
  'channel': 'b,isd:0',
  'csid': 7,
  'ccid': 'XiTKg9gBTRaaRh8vvg48WAAAAAc',
  'adl': 3,
  'crcl': '10.749722/59.916389,20000',
  's': '1',
  'uiv': '25029/200:1,1322/105:1,1320/105:1,1318/105:1,2555/106:1',
  'tid': 'CZQDDZApuclWMGvz7q1FVTeiW_',
  'sp': '20200320/20200322',
  'rms': '2', // tunable
  'p': 'pl',
  'l': 'pl',
  'ccy': 'PLN',
  'accoff': 0,
  'acclim': 25
};

export const TRIVAGO_BODY = {
  'operationName': 'regionSearch',
  'variables': {
    'searchType': 'cep.json',
    'queryParams': '',
    'pollData': null,
    'allowAdvertiserInfo2': false,
    'openItemsInNewTab': false,
    'showBusinessHotels': true,
    'showBudgetHotels': false,
    'isMobileList': false,
    'skipAlternativeDeals': false,
    'skipMinPriceExtraInfo': false,
    'shouldSkipRedirect': true,
    'aaScoreRating': false,
    'locale': 'PL',
    'cidns': '13437/200',
    'getRareFind': false,
    'useVar2DataSource': false
  },
  'extensions': {'persistedQuery': {'version': 1, 'sha256Hash': 'c5958a0f154bba9efb27eec29a8809492be0d4ee49704aabec1cca8f96889eab'}} // deprecatedable
};

export const TRIVAGO_OPTIONS: RequestInit = {
  'credentials': 'omit',
  'headers': {
    'accept': '*/*',
    'accept-language': 'pl',
    'apollographql-client-name': 'hs-web',
    'apollographql-client-version': 'v92_03_2_bi_42e59124e18',
    'content-type': 'application/json',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'x-request-id': '0A0102A5DD6E0A0102D200505E5F3A84545B92721487',
    'x-trv-cst': '27291-1,32046-1,33651-1,39578-1,40402-1,42164-1,42280-1,42673-1,43316-1,45124-1,45749-1,46136-1,46138-1,46164-1,46411-1,46535-1,46876-1,47123-1,47158-3,47225-1,47405-1,47748-1,47828-1,47908-1,48329-1,48401-1,48405-1,48438-1,48467-1,48491-1,48506-1,48531-1,48542-1,48673-1,48681-1,48700-1,48709-1,48921-1,49236-1,49291-1,49333-1,49415-1,49419-1,49476-1,49490-1,49492-1,49643-1,49722-1,49733-1,49916-1,49974-1,50008-1,50025-1,50153-1,50165-1,50182-1,50332-1,50680-1,50862-3,1443703219-1,1448029553-1,1472823160-1'
  },
  'referrer': 'https://www.trivago.pl/?aDateRange%5Barr%5D=2020-03-13&aDateRange%5Bdep%5D=2020-03-15&aPriceRange%5Bfrom%5D=0&aPriceRange%5Bto%5D=0&iRoomType=1&aRooms%5B0%5D%5Badults%5D=1&cpt2=13437%2F200&hasList=1&hasMap=0&bIsSeoPage=0&sortingId=1&slideoutsPageItemId=&iGeoDistanceLimit=20000&address=&addressGeoCode=&offset=0&ra=',
  'referrerPolicy': 'no-referrer-when-downgrade',
  'body': '',
  'method': 'POST',
  'mode': 'cors'
};

export const TRIVAGO_SUGGESTIONS_BODY: any = {
  'query': 'Bangko',
  'limit': 5,
  'platform': 'pl',
  'metadata': {
    'ctests': ['1443703219-1', '1448029553-1', '1459869632-1', '1472823160-1', '27291-1', '32046-1', '39578-1', '40402-1', '42164-1', '42280-1', '42673-1', '39875-1', '45749-1', '46135-1', '46164-1', '46411-1', '46587-1', '46876-1', '46535-1', '47123-1', '47357-1', '45124-1', '47748-1', '47225-1', '47405-1', '48329-1', '48491-1', '47828-1', '48405-1', '47908-1', '48700-1', '48542-1', '48506-1', '48531-1', '48681-1', '43316-1', '48673-1', '48921-1', '49476-1', '48467-1', '49419-1', '48401-1', '49490-1', '48404-1', '33651-1', '49915-1', '50200-1', '49791-1', '49492-1', '50182-1', '50198-1', '47794-1'],
    'clientId': 'bp8GxP28vnxTZHEl6AiOCRKIs_',
    'clientConnectionId': 'Xi3fuWPCrtKpqvdt5qog5wAAAEE',
    'clientSequenceId': 23
  },
  'spellCorrection': true
};
export const TRIVAGO_SUGGESTIONS_OPTIONS: RequestInit = {
  'credentials': 'omit',
  'headers': {
    'accept': 'application/json',
    'accept-language': 'pl',
    'content-type': 'text/plain',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'x-trv-cst': '1443703219-1,1448029553-1,1459869632-1,1472823160-1,27291-1,32046-1,39578-1,40402-1,42164-1,42280-1,42673-1,39875-1,45749-1,46135-1,46164-1,46411-1,46587-1,46876-1,46535-1,47123-1,47357-1,45124-1,47748-1,47225-1,47405-1,48329-1,48491-1,47828-1,48405-1,47908-1,48700-1,48542-1,48506-1,48531-1,48681-1,43316-1,48673-1,48921-1,49476-1,48467-1,49419-1,48401-1,49490-1,48404-1,33651-1,49915-1,50200-1,49791-1,49492-1,50182-1,50198-1,47794-1'
  },
  'referrer': 'https://www.trivago.pl/?aDateRange%5Barr%5D=2020-11-07&aDateRange%5Bdep%5D=2020-11-15&aPriceRange%5Bfrom%5D=0&aPriceRange%5Bto%5D=0&iRoomType=1&aRooms%5B0%5D%5Badults%5D=1&cpt2=1322%2F105%2C1527%2F106%2C1324%2F106%2C9%2F132%2C15893%2F200&iViewType=0&bIsSeoPage=0&sortingId=2&slideoutsPageItemId=&iGeoDistanceLimit=20000&address=&addressGeoCode=&offset=0&ra=',
  'referrerPolicy': 'no-referrer-when-downgrade',
  'body': '',
  'method': 'POST',
  'mode': 'cors'
};
