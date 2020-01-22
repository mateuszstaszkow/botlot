/* tslint:disable:max-line-length */
import {Component, OnInit} from '@angular/core';
import {from, of} from 'rxjs';
import {concatMap, delay} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'botlot';
  private readonly maxCost = 800;
  private readonly startingDay = 5;
  private readonly endingDay = 7;
  private readonly startingHour = 16;
  private readonly endingHour = 12;
  private readonly requestDebounce = 1000;
  private readonly url = 'https://flights-pa.clients6.google.com/$rpc/travel.frontend.flights.FlightsFrontendService/GetExploreDestinations';
  private body;
  private readonly chopinBody = [null, [[76.41934825983552, 139.5465543889834], [-22.491412363792442, -110.7659456110166]], [], [null, null, 1, null, null, 1, [1], null, null, null, null, null, null, [[[[['WAW', 0]]], null, [16], 0, [], [], '2020-03-13', [360], []], [null, [[['WAW', 0]]], [12], 0, [], [], '2020-03-15', [360], []]], null, null, null, true], null, 1];
  private readonly warsawBody = [null, [[77.23040204073588, 138.8406804442027], [-19.165137143911153, -111.47181955579737]], [], [null, null, 1, null, null, 1, [1], null, null, null, null, null, null, [[[[['/m/081m_', 4]]], null, [16], 0, [], [], '2020-03-13', [360], []], [null, [[['/m/081m_', 4]]], [12], 0, [], [], '2020-03-15', [360], []]], null, null, null, true], null, 1];
  private readonly gdanskBody = [null, [[79.71547567273853, 123.61006707315732], [-7.031069335573834, -126.70243292684256]], [], [null, null, 1, null, null, 1, [1], null, null, null, null, null, null, [[[[['/m/035m6', 4]]], null, [16], 0, [], [], '2020-03-13', [360], []], [null, [[['/m/035m6', 4]]], [12], 0, [], [], '2020-03-15', [360], []]], null, null, null, true], null, 1];
  private readonly options: RequestInit = {
    'credentials': 'omit',
    'headers': {
      'accept': '*/*',
      'accept-language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json+protobuf',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'x-goog-api-key': 'AIzaSyBSuiOWj4xTH9RtdV1Np-pwYPyfGniSEOE',
      'x-goog-upload-command': '["pl","PL","PLN",1,null,[-60]]',
      'x-goog-upload-protocol': '["!MzClMBFC_JO5L4rs2HtYqTwix9Ww6G4CAAAAdFIAAAAkmQNL9wpZui-ZBLct7PMbiER3aQSrE29mhvFEVd712tMqdPsRvV6AxBZ2L0A_TU2jlNYPFdGXyGNxgbeT2a3pZcw1hHbExYux-ctfeE2jsWmc8-OgnPEMUtP4sisFqXinQA1B3hBLaVKEejH5GiQ71X9biU2txZLJLC4XUPK7XG7AqvrJGyDtfno9F74TXMJL_Hy6vjnoY7zWdxujNaws2WAijcADtqulWUhvrnrm1UisL1uR8y-JD-t8i-uIuIGvYaDtRpcadrCLcza50EAACZ2eqERWxTzDo9UUbtI8kViu48vvvR9btfEHyjVURZHNs-O5uwGYo-tRlUAZ8TZL_nMCQPj40WlWHTdUTiA8mxMW3t75s_XuRyAn3_j0XjuBVSziXbiA93d2SWxw5LL0oy8YjbwIFu38CRL8hlOSSwPMTKCVUCnkv2dJAP52i9n9BPoRmzOkUL2YgyM9xIg5CPiieETE8o10qJGphYEkteC09yEmTb45E2gTGu2RN1RrA6E2qwdkXwi9VmNlHBjX6SDsCdwpGVQrJS2ilLq1yxBhUnxLQsjxDCaluFtgbDRtSHnQCMs4BW0bL4iYTBxrBnc-MBYpDqEP9AzHrsoNjXUroRt_ds9YyREUWb-OPeVRBObrzoZrHaAZo470kD6Oms5-A8fzb30izFb07t45650WPvLUX3Pp-F_hOREMZwL-KVQq_QXVPBapUWTJAlfV6L6R7_UxH6MUZbSOipYiAfQc6DIYxXbUVkJrrCUdA1bD0pEx5BpNPMjwkbNcE7EEsn-XPAAr_3gJD3qDsnI1rOhz1bxZfwnRYpMOuLdDN2_NaB_ZF3W1dc9_t9PSwO1_kc8FlvzdOe1iVKZXEwrttgCP79HKKbn6VCKs_zhyNPmmijNw6arJo92n_BdSJpoS5KQP-6KIJ4kxoLE_mCp-rh3i7-G5_o6jDgBBgKn2OGVRDL5wtWAfJrTEpxXvSGLABftrjPL-RfGpUapHAx994ri3qVqVHzpl2KPcEY9jCg9F-MIxo7eb8useODRhOlbJm38bDsGq5mqMnDuP1NxV_M-QdPHC7Ih9q1I9QpJgBVX-xp9SHB0zK1F5N2tZ6FXpIDR1fM6cQ-OOO0t9hBF6",null,null,39,null,null,null,0,"1"]',
      'x-user-agent': 'grpc-web-javascript/0.1'
    },
    'referrer': 'https://www.google.com/',
    'referrerPolicy': <any>'origin',
    'body': '',
    'method': 'POST',
    'mode': 'cors'
  };
  private readonly trivagoUrl = 'https://cdn-hs-graphql-dus.trivago.com/graphql';
  private readonly trivagoQueryParams = {
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
    'rms': '1',
    'p': 'pl',
    'l': 'pl',
    'ccy': 'PLN',
    'accoff': 0,
    'acclim': 25
  };
  private readonly trivagoBody = {
    'operationName': 'regionSearch',
    'variables': {
      'searchType': 'cep.json',
      'queryParams': '',
      'pollData': null,
      'isAirBnbSupported': true,
      'openItemsInNewTab': false,
      'showHomeAwayPremierProperties': true,
      'showGranularAAccType': false,
      'showBusinessHotels': true,
      'showBudgetHotels': false,
      'isMobileList': false,
      'skipAlternativeDeals': false,
      'skipMinPriceExtraInfo': true,
      'shouldSkipRedirect': true,
      'aaScoreRating': false,
      'locale': 'PL',
      'cidns': '25029/200',
      'getRareFind': false,
      'useVar2DataSource': false
    },
    'extensions': {'persistedQuery': {'version': 1, 'sha256Hash': '7fb45afe037b5f9ecdf9003fbab88733c19e51f0250684b195843b33f95a9039'}}
  };
  private readonly trivagoOptions: RequestInit = {
    'credentials': 'omit',
    'headers': {
      'accept': '*/*',
      'accept-language': 'pl',
      'apollographql-client-name': 'hs-web',
      'apollographql-client-version': 'v92_01_3_bv_41b52143c47',
      'content-type': 'application/json',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'x-request-id': '0A0102A688070A0102D200505E24CA833384277818171',
      'x-trv-cst': '1448029553-1,1459869632-1,1472823160-1,1472826866-1,27291-1,32046-1,39578-1,40402-1,42164-1,42280-1,42673-1,38217-1,39875-1,45349-1,45749-1,46136-1,46138-1,46164-1,46411-1,46587-1,46876-1,47158-3,46535-1,47123-1,47357-1,45124-1,45039-1,47748-1,47225-1,47405-1,48329-1,48491-1,47828-1,48405-1,47908-1,48700-1,48542-1,48506-1,48531-1,48681-1,46734-1,43316-1,48673-1,49290-1,48921-1,49476-1,48467-1,49346-2,49291-1,49665-1,49419-1,48401-1,48371-1,50076-1,49333-1,49490-1,48404-1,49915-1'
    },
    'referrer': 'https://www.trivago.pl/?aDateRange%5Barr%5D=2020-03-20&aDateRange%5Bdep%5D=2020-03-22&aPriceRange%5Bfrom%5D=0&aPriceRange%5Bto%5D=0&iRoomType=1&aRooms%5B0%5D%5Badults%5D=1&cpt2=25029%2F200%2C1322%2F105%2C1320%2F105%2C1318%2F105%2C2555%2F106%2C2007%2F106%2C1527%2F106%2C1324%2F106&iViewType=0&bIsSeoPage=0&sortingId=2&slideoutsPageItemId=&iGeoDistanceLimit=20000&address=&addressGeoCode=&offset=0&ra=',
    'referrerPolicy': 'no-referrer-when-downgrade',
    'body': '',
    'method': 'POST',
    'mode': 'cors'
  };
  private readonly bannedCountries = [
    'Poland',
    'United Kingdom',
    'Ukraine',
    'Germany',
    'Portugal',
    'Belgium',
    'Hungary',
    'Austria',
    'Greece',
    'Latvia',
    'Slovakia',
    'Romania',
    'Moldova',
    'Morocco'
  ];
  private readonly trivagoKeyByCity = {
    'Oslo': '25029/200:1,1322/105:1,1320/105:1,1318/105:1,2555/106:1',
    'Bukareszt': '1322/105:1,1320/105:1,1318/105:1,439258/200:1,2555/106:1',
    'Gmina Malmö': '1322/105:1,1320/105:1,1318/105:1,32986/200:1,2555/106:1',
    'Paryż': '1322/105:1,1320/105:1,1318/105:1,22235/200:1,2555/106:1',
    'Amsterdam': '1322/105:1,1320/105:1,1318/105:1,27561/200:1,2555/106:1',
    'Mediolan': '1322/105:1,1320/105:1,1318/105:1,26352/200:1,2555/106:1',
    'Billund': '1322/105:1,1320/105:1,1318/105:1,25844/200:1,2555/106:1',
    'Wilno': '1322/105:1,1320/105:1,1318/105:1,65776/200:1,2555/106:1',
    'Kaliningrad': '1322/105:1,1320/105:1,1318/105:1,66873/200:1,2555/106:1',
    'Praga': '1322/105:1,1320/105:1,1318/105:1,23442/200:1,2555/106:1',
    'Kopenhaga': '1322/105:1,1320/105:1,1318/105:1,25816/200:1,2555/106:1',
    'Tallin': '1322/105:1,1320/105:1,1318/105:1,64008/200:1,2555/106:1',
    'Sztokholm': '1322/105:1,1320/105:1,1318/105:1,33024/200:1,2555/106:1',
    'Wenecja': '1322/105:1,1320/105:1,1318/105:1,26802/200:1,2555/106:1',
    'Genewa': '1322/105:1,1320/105:1,1318/105:1,28797/200:1,2555/106:1',
    'Luksemburg': '1322/105:1,1320/105:1,1318/105:1,52449/200:1,2555/106:1',
    'Zurych': '1322/105:1,1320/105:1,1318/105:1,31357/200:1,2555/106:1',
    'Barcelona': '1322/105:1,1320/105:1,1318/105:1,13437/200:1,2555/106:1',
    'Madryt': '1322/105:1,1320/105:1,1318/105:1,13628/200:1,2555/106:1',
    'Goteborg': '1322/105:1,1320/105:1,1318/105:1,33125/200:1,2555/106:1',
    'Bazylea': '1322/105:1,1320/105:1,1318/105:1,27945/200:1,2555/106:1',
    'Nicea': '1322/105:1,1320/105:1,1318/105:1,23042/200:1,2555/106:1',
    'Helsinki': '1322/105:1,1320/105:1,1318/105:1,62244/200:1,2555/106:1',
    'Neapol': '1322/105:1,1320/105:1,1318/105:1,26246/200:1,2555/106:1',
    'Belgrad': '1322/105:1,1320/105:1,1318/105:1,23419/200:1,2555/106:1',
    'Moskwa': '1322/105:1,1320/105:1,1318/105:1,66938/200:1,2555/106:1',
    'Lyon': '1322/105:1,1320/105:1,1318/105:1,23345/200:1,2555/106:1',
    'Tel Awiw': '1322/105:1,1320/105:1,1318/105:1,65149/200:1,2555/106:1',
    'Florencja': '1322/105:1,1320/105:1,1318/105:1,26611/200:1,2555/106:1',
    'Rzym': '1322/105:1,1320/105:1,1318/105:1,25084/200:1,2555/106:1',
    'Bergen': '1322/105:1,1320/105:1,1318/105:1,25038/200:1,2555/106:1',
    'Zagrzeb': '1322/105:1,1320/105:1,1318/105:1,27219/200:1,2555/106:1',
    'Kiszyniów': '1322/105:1,1320/105:1,1318/105:1,74133/200:1,2555/106:1',
    'Bolonia': '1322/105:1,1320/105:1,1318/105:1,26105/200:1,2555/106:1',
    'Eindhoven': '1322/105:1,1320/105:1,1318/105:1,27553/200:1,2555/106:1',
    'Petersburg': '1322/105:1,1320/105:1,1318/105:1,66877/200:1,2555/106:1',
    'Dubrownik': '1322/105:1,1320/105:1,1318/105:1,26879/200:1,2555/106:1',
    'Malta': '1322/105:1,1320/105:1,1318/105:1,123/200:1,2555/106:1',
    'Sofia': '1322/105:1,1320/105:1,1318/105:1,15136/200:1,2555/106:1'
  };
  private flights = [];

  ngOnInit(): void {
    this.body = this.chopinBody;
    const weekends = this.buildRemainingWeekends();
    weekends[weekends.length - 1].isLast = true;
    from(weekends).pipe(
      concatMap(weekend => {
        const noisyDebounce = this.requestDebounce + (100 - Math.floor(Math.random() * 200));
        return of(weekend).pipe(
          delay(noisyDebounce)
        );
      })
    ).subscribe(weekend => {
      this.body[3][13][0][6] = weekend.friday;
      this.body[3][13][1][6] = weekend.sunday;
      this.body[3][13][0][2][0] = this.startingHour;
      this.body[3][13][1][2][0] = this.endingHour;
      this.options.body = JSON.stringify(this.body);
      this.getFlights(weekend);
    });
  }

  public sortFlights() {
    this.flights.sort((a, b) => this.sortBySummary(a, b));
  }

  private getFlights(weekend: Weekend) {
    fetch(this.url, this.options)
      .then(response => response.json())
      .then(response => {
        this.flights = this.flights.concat(response[0][1][4][0]
          .filter(flight => +flight[1][0][1] < this.maxCost)
          .map(flight => {
            const destination = response[0][0][3][0].find(d => d[0] === flight[0]);
            return {
              cost: flight[1][0][1] + ' zł',
              city: destination[2],
              country: destination[4],
              weekend
            };
          })
          .filter(flight => !this.bannedCountries.includes(flight.country))
        );
        if (weekend.isLast) {
          this.sendFlights();
        }
      })
      .catch(error => {
        this.flights[this.flights.length - 1].weekend.isLast = true;
        this.sendFlights();
      });
  }

  private sendFlights() {
    this.flights.forEach(flight => this.setHotel(flight));
  }

  private setHotel(flight) {
    // this.trivagoQueryParams.uiv = this.trivagoKeyByCity[flight.city];
    // this.trivagoQueryParams.sp = this.mapToTrivagoDate(flight.weekend.friday) + '/' + this.mapToTrivagoDate(flight.weekend.sunday);
    // this.trivagoBody.variables.queryParams = <any>JSON.stringify(this.trivagoQueryParams);
    // this.trivagoOptions.body = JSON.stringify(this.trivagoBody);
    const queryParams = { ...this.trivagoQueryParams };
    const body = { ...this.trivagoBody, variables: { ...this.trivagoBody.variables } };
    const options = { ...this.trivagoOptions };
    queryParams.uiv = this.trivagoKeyByCity[flight.city];
    queryParams.sp = this.mapToTrivagoDate(flight.weekend.friday) + '/' + this.mapToTrivagoDate(flight.weekend.sunday);
    body.variables.queryParams = <any>JSON.stringify(queryParams);
    options.body = JSON.stringify(body);
    this.fetchHotelAndAssign(flight, options);
  }

  private fetchHotelAndAssign(flight, options) {
    fetch(this.trivagoUrl, options)
      .then(response => response.json())
      .then(response => {
        const hotel = response.data.rs.accommodations.find(a => !a.accommodationType.value.includes('Hostel'));
        if (hotel) {
          this.assignHotelToFlight(flight, hotel);
          if (flight.weekend.isLast) {
            this.flights.sort((a, b) => this.sortBySummary(a, b));
          }
          return;
        }
        this.fetchHotelAndAssign(flight, options);
      })
      .catch(error => this.flights.sort((a, b) => this.sortBySummary(a, b)));
  }

  private assignHotelToFlight(flight, hotel) {
    const hotelData = { name: hotel.name.value, cost: hotel.deals.bestPrice.pricePerStay };
    flight.summary = +flight.cost.split(' ')[0] + hotelData.cost;
    flight.hotel = hotelData;
  }

  private sortBySummary(a, b): number {
    if (a.summary > b.summary) {
      return 1;
    } else if (a.summary < b.summary) {
      return -1;
    }
    return 0;
  }

  private sortByCost(a, b): number {
    const aCost = +a.cost.split(' ')[0];
    const bCost = +b.cost.split(' ')[0];
    if (aCost > bCost) {
      return 1;
    } else if (aCost < bCost) {
      return -1;
    }
    return 0;
  }

  private buildRemainingWeekends(): Weekend[] {
    // const today = new Date('2020-05-07');
    // const weekends: Weekend[] = [];
    // let friday = this.getNextDayOfWeek(today, this.startingDay);
    // let sunday = this.getNextDayOfWeek(friday, this.endingDay);
    // while (sunday.getDay() < 31 && sunday.getMonth() === 4) {
    const today = new Date();
    const weekends: Weekend[] = [];
    let friday = this.getNextDayOfWeek(today, this.startingDay);
    let sunday = this.getNextDayOfWeek(friday, this.endingDay);
    while (sunday.getFullYear() === today.getFullYear()) {
      weekends.push({
        friday: this.mapToISOStringDate(friday),
        sunday: this.mapToISOStringDate(sunday)
      });
      friday = this.getNextDayOfWeek(sunday, this.startingDay);
      sunday = this.getNextDayOfWeek(friday, this.endingDay);
    }
    return weekends;
  }

  private mapToTrivagoDate(date: string): string {
    return date
      .replace(/-/g, '');
  }

  private mapToISOStringDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getNextDayOfWeek(date, dayOfWeek): Date {
    if (dayOfWeek < 0 || dayOfWeek > 7) {
      return date;
    }
    const resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    return resultDate;
  }

}

export interface Weekend {
  friday: string;
  sunday: string;
  isLast?: boolean;
}
