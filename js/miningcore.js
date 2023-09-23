// read WebURL from current browser
var WebURL         = window.location.protocol + "//" + window.location.hostname + "/";  // Website URL is:  https://domain.com/
// WebURL correction if not ends with /
if (WebURL.substring(WebURL.length-1) != "/")
{
	WebURL = WebURL + "/";
	console.log('Corrected WebURL, does not end with / -> New WebURL : ', WebURL);
}
var API            = "http://77.105.182.83:4100/" + "api/";   						// API address is:  https://domain.com/api/
// API correction if not ends with /
if (API.substring(API.length-1) != "/")
{
	API = API + "/";
	console.log('Corrected API, does not end with / -> New API : ', API);
} 
var stratumAddress = window.location.hostname;           				// Stratum address is:  domain.com
var externalPortDelta = 0;								//if you need several pool instances with different ports numbers - change this value in each pool server instance







// --------------------------------------------------------------------------------------------
// no need to change anything below here
// --------------------------------------------------------------------------------------------
console.log('MiningPool.WebUI : ', WebURL);		             			      // Returns website URL
console.log('API address used : ', API);                                      // Returns API URL
console.log('Stratum address  : ', "stratum+tcp://" + stratumAddress + ":");  // Returns Stratum URL
console.log('Page Load        : ', window.location.href);                     // Returns full URL

currentPage = "index"

// check browser compatibility
var nua = navigator.userAgent;
//var is_android = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));
var is_IE = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Trident') > -1) && !(nua.indexOf('Chrome') > -1));
if(is_IE) {
	console.log('Running in IE browser is not supported - ', nua);
}

// Load INDEX Page content
function loadIndex() {
  $("div[class^='page-").hide();
  
  $(".page").hide();
  //$(".page-header").show();
  $(".page-wrapper").show();
  $(".page-footer").show();
  
  var hashList = window.location.hash.split(/[#/?=]/);
  //var fullHash = document.URL.substr(document.URL.indexOf('#')+1);   //IE
  // example: #vtc/dashboard?address=VttsC2.....LXk9NJU
  currentPool    = hashList[1];
  currentPage    = hashList[2];
  currentAddress = hashList[3];
  
  if (currentPool && !currentPage)
  {
    currentPage ="stats"
  }
  else if(!currentPool && !currentPage)
  {
    currentPage ="index";
  }
  if (currentPool && currentPage) {
    loadNavigation();
    $(".main-index").hide();
	$(".main-pool").show();
	$(".page-" + currentPage).show();
	$(".main-sidebar").show();
  } else {
    $(".main-index").show();
	$(".main-pool").hide();
	$(".page-index").show();
    $(".main-sidebar").hide();
  }
  
  if (currentPool) {
	$("li[class^='nav-']").removeClass("active");
    
	switch (currentPage) {
      case "stats":
	    console.log('Loading stats page content');
	    $(".nav-stats").addClass("active");
        loadStatsPage();
        break;
      case "dashboard":
	    console.log('Loading dashboard page content');
        $(".nav-dashboard").addClass("active");
		loadDashboardPage();
        break;
	  case "miners":
	    console.log('Loading miners page content');
        $(".nav-miners").addClass("active");
		loadMinersPage();
        break;
	  case "workers":
	    console.log('Loading workers page content');
        $(".nav-workers").addClass("active");
		loadWorkerStatistics();
        break;
      case "blocks":
	    console.log('Loading blocks page content');
	    $(".nav-blocks").addClass("active");
        loadBlocksPage();
        break;
      case "payments":
	    console.log('Loading payments page content');
	    $(".nav-payments").addClass("active");
        loadPaymentsPage();
        break;
      case "connect":
	    console.log('Loading connect page content');
        $(".nav-connect").addClass("active");
		loadConnectPage();
        break;
      default:
      // default if nothing above fits
    }
  } else {
    loadHomePage();
  }
  scrollPageTop();
}


// Load HOME page content
function loadHomePage() {
  console.log('Loading home page content');
  return $.ajax(API + "pools")
    .done(function(data) {
      const poolCoinCardTemplate = $(".index-coin-card-template").html();
	  //const poolCoinTableTemplate = "";  //$(".index-coin-table-template").html();
	  
	  var poolCoinTableTemplate = "";
		
      $.each(data.pools, function(index, value) {
 
        var coinLogo = "<img class='coinimg' src='img/coin/icon/" + value.coin.type.toLowerCase() + ".png' />";
		var coinName = value.coin.name;
		if (typeof coinName === "undefined" || coinName === null) {coinName = value.coin.type;} 
        		
		poolCoinTableTemplate += "<tr class='coin-table-row' href='#" + value.id + "'>";
		poolCoinTableTemplate += "<td class='coin'><a href='#" + value.id + "'<span>" + coinLogo + coinName + " (" + value.coin.type.toUpperCase() + ") </span></a></td>";
		poolCoinTableTemplate += "<td class='algo'>" + value.coin.algorithm + "</td>";
		poolCoinTableTemplate += "<td class='miners'>" + value.poolStats.connectedMiners + "</td>";
		poolCoinTableTemplate += "<td class='pool-hash'>" + _formatter(value.poolStats.poolHashrate, 5, "H/s") + "</td>";
		poolCoinTableTemplate += "<td class='fee'>" + value.poolFeePercent + " %</td>";
		poolCoinTableTemplate += "<td class='net-hash'>" + _formatter(value.networkStats.networkHashrate, 5, "H/s") + "</td>";
		poolCoinTableTemplate += "<td class='net-diff'>" + _formatter(value.networkStats.networkDifficulty, 5, "") + "</td>";
		poolCoinTableTemplate += "<td class='card-btn col-hide'>Go Mine " + coinLogo + coinName + "</td>";
		poolCoinTableTemplate += "</tr>";
      });

      //if (poolList.length > 0) {
       	$(".pool-coin-table").html(poolCoinTableTemplate);
      //}
	  	  
	  $(document).ready(function() {
        $('#pool-coins tr').click(function() {
          var href = $(this).find("a").attr("href");
          if(href) {
            window.location = href;
          }
        });
      });
	  
    })
    .fail(function() {
      var poolCoinTableTemplate = "";
	  
	  poolCoinTableTemplate += "<tr><td colspan='8'> ";
	  poolCoinTableTemplate += "<div class='alert alert-warning'>"
		poolCoinTableTemplate += "	<h4><i class='fas fa-exclamation-triangle'></i> Warning!</h4>";
		poolCoinTableTemplate += "	<hr>";
		poolCoinTableTemplate += "	<p>The pool is currently down for maintenance.</p>";
		poolCoinTableTemplate += "	<p>Please try again later.</p>";
	  poolCoinTableTemplate += "</div>"
	  poolCoinTableTemplate += "</td></tr>";
	  
	  $(".pool-coin-table").html(poolCoinTableTemplate);
	  
    });
}


// Load STATS page content
function loadStatsPage() {
  //clearInterval();
  setInterval(
    (function load() {
      loadStatsData();
      return load;
    })(),
    60000
  );
  setInterval(
    (function load() {
      loadStatsChart();
      return load;
    })(),
    600000
  );
}

// Load WORKERS page content
function loadWorkerStatistics() {
  //clearInterval();
  function render() {
    //clearInterval();
    setInterval(
      (function load() {
        fetchWorkerStatistics($("#workerName").val());
		fetchWorkerPerformance($("#workerName").val());
        return load;
      })(),
      60000
    );
  }
  var walletQueryString = window.location.hash.split(/[#/?]/)[3];
  if (walletQueryString) {
    var worker = window.location.hash.split(/[#/?]/)[3].replace("workerName=", "");
    if (worker) {
	  $(workerName).val(worker);
	  localStorage.setItem(currentPool + "-workerName", worker);
      render();
    }
  }
  if (localStorage[currentPool + "-workerName"]) {
    $("#workerName").val(localStorage[currentPool + "-workerName"]);
  }
}


// Load DASHBOARD page content
function loadDashboardPage() {
  function render() {
    //clearInterval();
    setInterval(
      (function load() {
        loadDashboardData($("#walletAddress").val());
        loadDashboardWorkerList($("#walletAddress").val());
        loadDashboardChart($("#walletAddress").val());
        return load;
      })(),
      60000
    );
  }
  var walletQueryString = window.location.hash.split(/[#/?]/)[3];
  if (walletQueryString) {
    var wallet = window.location.hash.split(/[#/?]/)[3].replace("address=", "");
    if (wallet) {
      $(walletAddress).val(wallet);
      localStorage.setItem(currentPool + "-walletAddress", wallet);
      render();
    }
  }
  if (localStorage[currentPool + "-walletAddress"]) {
    $("#walletAddress").val(localStorage[currentPool + "-walletAddress"]);
  }
}

$(document).ready(function() {
  $('#workerDailyStats').DataTable({
    info: false,
    ordering: false,
    paging: true,
	searching: false
  });
  $('#workerDevices').DataTable({
    info: false,
    ordering: true,
    paging: true,
    searching: false,
    createdRow: function(row, data) {
      if (data[5] === 'Online') {
        $('td', row).eq(5).addClass('online');
      } else {
        $('td', row).eq(5).addClass('offline');
      }
    }
  });
});


// Load MINERS page content
function loadMinersPage() {
  return $.ajax(API + "pools/" + currentPool + "/miners?page=0&pagesize=20")
    .done(function(data) {
      var minerList = "";
      if (data.length > 0) {
        $.each(data, function(index, value) {
          minerList += "<tr>";
          //minerList +=   "<td>" + value.miner + "</td>";
		  minerList +=   '<td>' + value.miner.substring(0, 12) + ' &hellip; ' + value.miner.substring(value.miner.length - 12) + '</td>';
          //minerList += '<td><a href="' + value.minerAddressInfoLink + '" target="_blank">' + value.miner.substring(0, 12) + ' &hellip; ' + value.miner.substring(value.miner.length - 12) + '</td>';
          minerList += "<td>" + _formatter(value.hashrate, 5, "H/s") + "</td>";
          minerList += "<td>" + _formatter(value.sharesPerSecond, 5, "S/s") + "</td>";
          minerList += "</tr>";
        });
      } else {
        minerList += '<tr><td colspan="4">No miner connected</td></tr>';
      }
      $("#minerList").html(minerList);
    })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(loadMinersList)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}

function fetchWorkerPerformance(workerName) {
  return $.ajax(API + "pools/" + currentPool + "/workers/" + workerName + "/performance")
    .done(function(data) {
		const labels = [];
		const hashrates = [];
		let sumHashrate1Hour = 0;
		let sumHashrate24Hours = 0;
		
		data.forEach((item, index) => {
		  // ??????????? UNIX timestamp ? ???? ? ?????? (?????? 24-?????)
		  labels.push(new Date(item.created * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }));

		  // ???????? ???????? ?? ???? ??????????? ??????? ???????
		  let totalHashrate = 0;
		  Object.values(item.workers).forEach(workerData => {
			totalHashrate += workerData.hashrate;
		  });

		  // ??????????? ????? ??????? ? TH/s
		  hashrates.push(totalHashrate / 1e12);
		  
		  // ??????? ???????? ???????? ?? ????????? ??? ? ?? ????????? 24 ????
		  if (index < data.length - 1) {
			sumHashrate24Hours += totalHashrate;
			if (index < 1) {
			  sumHashrate1Hour += totalHashrate;
			}
		  }
		});
		
		// ?????????? ??????? ????????
		let averageHashrate1Hour = sumHashrate1Hour / 1;
		let averageHashrate24Hours = sumHashrate24Hours / 24;

		// ?????????? ???????? ?? ????????
		//document.getElementById('averageHashrate1Hour').textContent = formatHashrate(averageHashrate1Hour);
		//document.getElementById('averageHashrate24Hours').textContent = formatHashrate(averageHashrate24Hours);
		document.querySelector('.worker-name').textContent = worker;
		const ctx = document.getElementById('workerHashrateChart').getContext('2d');
		const myChart = new Chart(ctx, {
		  type: 'line',
		  data: {
			labels: labels,
			datasets: [
			  {
				label: 'Hashrate (TH/s)',
				data: hashrates,
				borderColor: 'rgba(75, 192, 192, 1)',
				borderWidth: 1,
				fill: false
			  }
			]
		  },
		  options: {
			scales: {
			  y: {
				ticks: {
				  callback: function(value) {
					return formatHashrate(value * 1e12); // ??????????? ??????? ? ???? ? ???????????
				  }
				}
			  }
			}
		  }
		});
	  })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(fetchWorkerPerformance)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}

function formatHashrate(value) {
  if (value === 0 || isNaN(value)) {
    return "0 H/s";
  }

  var units = ["", "k", "M", "G", "T", "P", "E", "Z", "Y"];
  var order = Math.floor(Math.log10(value) / 3);
  var unitname = units[order];
  var num = value / Math.pow(10, order * 3);
  return num.toFixed(1) + ' ' + unitname + "H/s";
}


// Search devices function
$(document).ready(function() {
  // Search devices function
  document.getElementById('searchDevice').addEventListener('keyup', function() {
    const filter = this.value.toUpperCase();
    const tbody = document.getElementById('workerDevices').getElementsByTagName('tbody')[0];
    const rows = tbody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i].getElementsByTagName('td')[0];
      if (cell) {
        const txtValue = cell.textContent || cell.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          rows[i].style.display = '';
        } else {
          rows[i].style.display = 'none';
        }
      }
    }
  });
});


// Function to fetch worker and devices statistics
function fetchWorkerStatistics(workerName) {
  return $.ajax(API + "pools/" + currentPool + "/workers?workerName=" + workerName)
    .done(function(data) {
      document.getElementById('totalDevices').textContent = data.workerDevicesStatistic.totalDevices;
      document.getElementById('devicesOnline').textContent = data.workerDevicesStatistic.devicesOnline;
      document.getElementById('devicesOffline').textContent = data.workerDevicesStatistic.devicesOffline;
      document.getElementById('averageHashrate1Hour').textContent = _formatter(data.workerHashRate.hourlyAverageHashRate, 5, 'H/s');
      document.getElementById('averageHashrate24Hours').textContent = _formatter(data.workerHashRate.dailyAverageHashRate, 5, 'H/s');

     
	  // Worker's Daily Statistics
      const workerDailyStatsTable = $('#workerDailyStats').DataTable();
      workerDailyStatsTable.clear().draw();
      data.workerStatistics.forEach(stat => {
        workerDailyStatsTable.row.add([
          new Date(stat.date).toLocaleDateString(),
		  _formatter(stat.averageHashRate, 5, 'H/s'),
          stat.totalAcceptedShares,
          stat.totalRejectedShares,
          stat.totalPayment != null ? stat.totalPayment.toFixed(8) : 0
        ]).draw();
      });
	  
      // Worker's Devices
      const workerDevicesTable = $('#workerDevices').DataTable();
      workerDevicesTable.clear().draw();
      data.workerDevicesStatistic.workerDevicesStatistic.forEach(device => {
        workerDevicesTable.row.add([
          device.deviceName,
		  new Date(device.lastShareDate).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
          _formatter(device.currentHashRate, 5, 'H/s'),
		  _formatter(device.hourlyAverageHashRate, 5, 'H/s'),
		  _formatter(device.dailyAverageHashRate, 5, 'H/s'),
          device.isOnline === true ? 'Online' : 'Offline'
        ]).draw();
      });
    })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(loadDashboardData)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}


// Load BLOCKS page content
function loadBlocksPage() {
  return $.ajax(API + "pools/" + currentPool + "/blocks?page=0&pageSize=100")
    .done(function(data) {
      var blockList = "";
      if (data.length > 0) {
        $.each(data, function(index, value) {
		  var createDate = convertLocalDateToUTCDate(new Date(value.created),false);
          var effort = Math.round(value.effort * 100);
          var effortClass = "";
          if (effort < 30) {
            effortClass = "effort1";
          } else if (effort < 80) {
            effortClass = "effort2";
          } else if (effort < 110) {
            effortClass = "effort3";
          } else {
            effortClass = "effort4";
          }

          blockList += "<tr>";
          blockList += "<td>" + createDate + "</td>";
          blockList += "<td><a href='" + value.infoLink + "' target='_blank'>" + value.blockHeight + "</a></td>";
          if (typeof value.effort !== "undefined") {
            blockList += "<td class='" + effortClass + "'>" + effort + "%</td>";
          } else {
            blockList += "<td>n/a</td>";
          }
          var status = value.status;
          blockList += "<td>" + status + "</td>";
          blockList += "<td>" + _formatter(value.reward, 5, "") + "</td>";
          blockList += "<td><div class='c100 small p" + Math.round(value.confirmationProgress * 100) + "'><span>" + Math.round(value.confirmationProgress * 100) + "%</span><div class='slice'><div class='bar'></div><div class='fill'></div></div></div></td>";
          blockList += "</tr>";
        });
      } else {
        blockList += '<tr><td colspan="6">No blocks found yet</td></tr>';
      }

      $("#blockList").html(blockList);
    })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(loadBlocksList)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}

// Load PAYMENTS page content
function loadPaymentsPage() {
  return $.ajax(API + "pools/" + currentPool + "/payments?page=0&pageSize=100")
    .done(function(data) {
      var paymentList = "";
      if (data.length > 0) {
        $.each(data, function(index, value) {
          var createDate = convertLocalDateToUTCDate(new Date(value.created),false);
          paymentList += '<tr>';
          paymentList +=   "<td>" + createDate + "</td>";
          paymentList +=   '<td><a href="' + value.addressInfoLink + '" target="_blank">' + value.address.substring(0, 12) + ' &hellip; ' + value.address.substring(value.address.length - 12) + '</td>';
          paymentList +=   '<td>' + _formatter(value.amount, 5, '') + '</td>';
          paymentList +=   '<td colspan="2"><a href="' + value.transactionInfoLink + '" target="_blank">' + value.transactionConfirmationData.substring(0, 16) + ' &hellip; ' + value.transactionConfirmationData.substring(value.transactionConfirmationData.length - 16) + ' </a></td>';
          paymentList += '</tr>';
        });
      } else {
        paymentList += '<tr><td colspan="4">No payments found yet</td></tr>';
      }
      $("#paymentList").html(paymentList);
    })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(loadPaymentsList)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}

// Load CONNECTION page content
function loadConnectPage() {
  return $.ajax(API + "pools")
    .done(function(data) {
      var connectPoolConfig = "";
      $.each(data.pools, function(index, value) {
        if (currentPool === value.id) {
			
			defaultPort = Object.keys(value.ports)[0];
        	coinName = value.coin.name;
			coinType = value.coin.type.toLowerCase();
			algorithm = value.coin.algorithm;
			
			// Connect Pool config table
			connectPoolConfig += "<tr><td>Crypto Coin name</td><td>" + coinName + " (" + value.coin.type + ") </td></tr>";
			//connectPoolConfig += "<tr><td>Coin Family line </td><td>" + value.coin.family + "</td></tr>";
			connectPoolConfig += "<tr><td>Coin Algorithm</td><td>" + value.coin.algorithm + "</td></tr>";
			connectPoolConfig += '<tr><td>Pool Wallet</td><td><a href="' + value.addressInfoLink + '" target="_blank">' + value.address.substring(0, 12) + " &hellip; " + value.address.substring(value.address.length - 12) + "</a></td></tr>";
			connectPoolConfig += "<tr><td>Payout Scheme</td><td>" + value.paymentProcessing.payoutScheme + "</td></tr>";
			connectPoolConfig += "<tr><td>Minimum Payment</td><td>" + value.paymentProcessing.minimumPayment + " " + value.coin.type + "</td></tr>";
			if (typeof value.paymentProcessing.minimumPaymentToPaymentId !== "undefined") {
				connectPoolConfig += "<tr><td>Minimum Payout (to Exchange)</td><td>" + value.paymentProcessing.minimumPaymentToPaymentId + "</td></tr>";
			}
			connectPoolConfig += "<tr><td>Pool Fee</td><td>" + value.poolFeePercent + "%</td></tr>";
			$.each(value.ports, function(port, options) {
				var externalPort = Number(port) + externalPortDelta;
				connectPoolConfig += "<tr><td>stratum+tcp://" + stratumAddress + ":" + externalPort + "</td><td>";
				if (typeof options.varDiff !== "undefined" && options.varDiff != null) {
					connectPoolConfig += "Difficulty Variable / " + options.varDiff.minDiff + " &harr; ";
					if (typeof options.varDiff.maxDiff === "undefined" || options.varDiff.maxDiff == null) {
						connectPoolConfig += "&infin; ";
					} else {
						connectPoolConfig += options.varDiff.maxDiff;
					}
				} else {
					connectPoolConfig += "Difficulty Static / " + options.difficulty ;
				}
				connectPoolConfig += "</td></tr>";
			});
 
        }
      });
      connectPoolConfig += "</tbody>";
      $("#connectPoolConfig").html(connectPoolConfig);
	  
	  
	  // Connect Miner config 
	  $("#miner-config").html("");
      $("#miner-config").load("poolconfig/" + coinType + ".html",
        function( response, status, xhr ) {
          if ( status == "error" ) {
			$("#miner-config").load("poolconfig/default1.html",
			  function(responseText){
				var config = $("#miner-config")
                .html()
				.replace(/{{ stratumAddress }}/g, stratumAddress + ":" + defaultPort)
				.replace(/{{ coinName }}/g, coinName)
				.replace(/{{ aglorithm }}/g, algorithm);
				$(this).html(config);  
			  }
			);
		  } else {
			var config = $("#miner-config")
            .html()
            .replace(/{{ stratumAddress }}/g, stratumAddress + ":" + defaultPort)
			.replace(/{{ coinName }}/g, coinName)
			.replace(/{{ aglorithm }}/g, algorithm);
            $(this).html(config);
		  }
        }
      );
    })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(loadConnectConfig)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}

// Workers - load wallet stats
function loadWorker() {
  console.log( 'Loading wallet address:',$("#workerName").val() );
  if ($("#workerName").val().length > 0) {
    localStorage.setItem(currentPool + "-workerName", $("#workerName").val() );
  }
  var coin = window.location.hash.split(/[#/?]/)[1];
  var currentPage = window.location.hash.split(/[#/?]/)[2] || "stats";
  window.location.href = "#" + currentPool + "/" + currentPage + "?workerName=" + $("#workerName").val();
}


// Dashboard - load wallet stats
function loadWallet() {
  console.log( 'Loading wallet address:',$("#walletAddress").val() );
  if ($("#walletAddress").val().length > 0) {
    localStorage.setItem(currentPool + "-walletAddress", $("#walletAddress").val() );
  }
  var coin = window.location.hash.split(/[#/?]/)[1];
  var currentPage = window.location.hash.split(/[#/?]/)[2] || "stats";
  window.location.href = "#" + currentPool + "/" + currentPage + "?address=" + $("#walletAddress").val();
}

/*
1 kH/s* (one kilo hash) is 1,000 (one thousand) hashes per second
1 MH/s (one mega hash) is 1,000,000 (one million) hashes per second
1 GH/s (one giga hash) is 1,000,000,000 (one billion) hashes per second
1 TH/s (one tera hash) is 1,000,000,000,000 (one trillion) hashes per second
1 PH/s (one peta hash) is 1,000,000,000,000,000 (one quadrillion) hashes per second
1 EH/s (one exa hash) is 1,000,000,000,000,000,000 (one quintillion) hashes per second
1 ZH/s (one zeta hash) is 1,000,000,000,000,000,000,000 (one sextillion) hashes per second
1 YH/s (one yotta hash) is 1,000,000,000,000,000,000,000,000 (one septillion) hashes per second

* kH/s is always written with a lower case k as upper case K is reserved for Kelvin (which is a measurement of heat).
*/
// General formatter function
function _formatter(value, decimal, unit) {
  if (value === 0) {
    return "0 " + unit;
  } else {
    var si = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" },
      { value: 1e21, symbol: "Z" },
      { value: 1e24, symbol: "Y" }
    ];
    for (var i = si.length - 1; i > 0; i--) {
      if (value >= si[i].value) {
        break;
      }
    }
    return ((value / si[i].value).toFixed(decimal).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + " " + si[i].symbol + unit);
  }
}


// Time convert Local -> UTC
function convertLocalDateToUTCDate(date, toUTC) {
  date = new Date(date);
  //Local time converted to UTC
  var localOffset = date.getTimezoneOffset() * 60000;
  var localTime = date.getTime();
  if (toUTC) {
    date = localTime + localOffset;
  } else {
    date = localTime - localOffset;
  }
  newDate = new Date(date);
  return newDate;
}


// Time convert UTC -> Local
function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
    var localOffset = date.getTimezoneOffset() / 60;
    var hours = date.getUTCHours();
    newDate.setHours(hours - localOffset);
    return newDate;
}


// Scroll to top off page
function scrollPageTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  var elmnt = document.getElementById("page-scroll-top");
  elmnt.scrollIntoView();
}


// Check if file exits
function doesFileExist(urlToFile) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', urlToFile, false);
    xhr.send();
     
    if (xhr.status == "404") {
        return false;
    } else {
        return true;
    }
}


// STATS page data
function loadStatsData() {
  return $.ajax(API + "pools")
    .done(function(data) {
      $.each(data.pools, function(index, value) {
        if (currentPool === value.id) {
			
		  $("#blockchainHeight").text(value.networkStats.blockHeight);
		  $("#connectedPeers").text(value.networkStats.connectedPeers);
		  $("#minimumPayment").text(value.paymentProcessing.minimumPayment + " " + value.coin.type);
		  $("#payoutScheme").text(value.paymentProcessing.payoutScheme);
		  $("#poolFeePercent").text(value.poolFeePercent + " %");
		  
          $("#poolHashRate").text(_formatter(value.poolStats.poolHashrate, 5, "H/s"));
		  $("#poolMiners").text(value.poolStats.connectedMiners + " Worker(s)");
          
          $("#networkHashRate").text(_formatter(value.networkStats.networkHashrate, 5, "H/s"));
          $("#networkDifficulty").text(_formatter(value.networkStats.networkDifficulty, 5, ""));
        }
      });
    })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(loadStatsData)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}


// STATS page charts
function loadStatsChart() {
  return $.ajax(API + "pools/" + currentPool + "/performance")
    .done(function(data) {
      labels = [];
	  
	  poolHashRate = [];
      networkHashRate = [];
      networkDifficulty = [];
      connectedMiners = [];
      connectedWorkers = [];
      
      $.each(data.stats, function(index, value) {
        if (labels.length === 0 || (labels.length + 1) % 4 === 1) {
          var createDate = convertLocalDateToUTCDate(new Date(value.created),false);
          labels.push(createDate.getHours() + ":00");
        } else {
          labels.push("");
        }
		poolHashRate.push(value.poolHashrate);
        networkHashRate.push(value.networkHashrate);
		networkDifficulty.push(value.networkDifficulty);
        connectedMiners.push(value.connectedMiners);
        connectedWorkers.push(value.connectedWorkers);
      });
	  
      var dataPoolHash          = {labels: labels,series: [poolHashRate]};
      var dataNetworkHash       = {labels: labels,series: [networkHashRate]};
      var dataNetworkDifficulty = {labels: labels,series: [networkDifficulty]};
      var dataMiners            = {labels: labels,series: [connectedMiners,connectedWorkers]};
	  
	  var options = {
		height: "200px",
        showArea: false,
        seriesBarDistance: 1,
        // low:Math.min.apply(null,networkHashRate)/1.1,
        axisX: {
          showGrid: false
        },
        axisY: {
          offset: 47,
          scale: "logcc",
          labelInterpolationFnc: function(value) {
            return _formatter(value, 1, "");
          }
        },
        lineSmooth: Chartist.Interpolation.simple({
          divisor: 2
        })
      };
	  
      var responsiveOptions = [
        [
          "screen and (max-width: 320px)",
          {
            axisX: {
              labelInterpolationFnc: function(value) {
                return value[1];
              }
            }
          }
        ]
      ];
      Chartist.Line("#chartStatsHashRate", dataNetworkHash, options, responsiveOptions);
      Chartist.Line("#chartStatsHashRatePool",dataPoolHash,options,responsiveOptions);
      Chartist.Line("#chartStatsDiff", dataNetworkDifficulty, options, responsiveOptions);
      Chartist.Line("#chartStatsMiners", dataMiners, options, responsiveOptions);
 
    })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(loadStatsChart)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}


// DASHBOARD page data
function loadDashboardData(walletAddress) {
  return $.ajax(API + "pools/" + currentPool + "/miners/" + walletAddress)
    .done(function(data) {
      $("#pendingShares").text(_formatter(data.pendingShares, 0, ""));
      var workerHashRate = 0;
      if (data.performance) {
        $.each(data.performance.workers, function(index, value) {
          workerHashRate += value.hashrate;
        });
      }
      $("#minerHashRate").text(_formatter(workerHashRate, 5, "H/s"));
      $("#pendingBalance").text(_formatter(data.pendingBalance, 5, ""));
      $("#paidBalance").text(_formatter(data.todayPaid, 5, ""));
      $("#lifetimeBalance").text(_formatter(data.pendingBalance + data.totalPaid, 5, "")
      );
    })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(loadDashboardData)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}


// DASHBOARD page Miner table
function loadDashboardWorkerList(walletAddress) {
  return $.ajax(API + "pools/" + currentPool + "/miners/" + walletAddress)
    .done(function(data) {
      var workerList = "";
      if (data.performance) {
        var workerCount = 0;
        $.each(data.performance.workers, function(index, value) {
          workerCount++;
          workerList += "<tr>";
          workerList += "<td>" + workerCount + "</td>";
          if (index.length === 0) {
            workerList += "<td>Unnamed</td>";
          } else {
            workerList += "<td>" + index + "</td>";
          }
          workerList += "<td>" + _formatter(value.hashrate, 5, "H/s") + "</td>";
          workerList +=
            "<td>" + _formatter(value.sharesPerSecond, 5, "S/s") + "</td>";
          workerList += "</tr>";
        });
      } else {
        workerList += '<tr><td colspan="4">None</td></tr>';
      }
      $("#workerCount").text(workerCount);
      $("#workerList").html(workerList);
    })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(loadDashboardWorkerList)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}


// DASHBOARD page chart
function loadDashboardChart(walletAddress) {
  return $.ajax(API + "pools/" + currentPool + "/miners/" + walletAddress + "/performance")
    .done(function(data) {

		labels = [];
        minerHashRate = [];
		
        $.each(data, function(index, value) {
          if (labels.length === 0 || (labels.length + 1) % 4 === 1) {
            var createDate = convertLocalDateToUTCDate(
              new Date(value.created),
              false
            );
            labels.push(createDate.getHours() + ":00");
          } else {
            labels.push("");
          }
          var workerHashRate = 0;
          $.each(value.workers, function(index2, value2) {workerHashRate += value2.hashrate;});
          minerHashRate.push(workerHashRate);
        });
        var data = {labels: labels,series: [minerHashRate]};
        var options = {
          height: "200px",
		  showArea: true,
		  seriesBarDistance: 1,
          axisX: {
            showGrid: false
          },
          axisY: {
            offset: 47,
            labelInterpolationFnc: function(value) {
              return _formatter(value, 1, "");
            }
          },
          lineSmooth: Chartist.Interpolation.simple({
            divisor: 2
          })
        };
        var responsiveOptions = [
          [
          "screen and (max-width: 320px)",
          {
            axisX: {
              labelInterpolationFnc: function(value) {
                return value[0];
              }
            }
          }
        ]
        ];
        Chartist.Line("#chartDashboardHashRate", data, options, responsiveOptions);

    })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(loadDashboardChart)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}


// Generate Coin based sidebar
function loadNavigation() {
  return $.ajax(API + "pools")
    .done(function(data) {
	  var coinLogo = "";
	  var coinName = "";
	  var poolList = "<ul class='navbar-nav '>";
      $.each(data.pools, function(index, value) {
		poolList += "<li class='nav-item'>";
        poolList += "  <a href='#" + value.id.toLowerCase() + "' class='nav-link coin-header" + (currentPool == value.id.toLowerCase() ? " coin-header-active" : "") + "'>"
		poolList += "  <img  src='img/coin/icon/" + value.coin.type.toLowerCase() + ".png' /> " + value.coin.type;
        poolList += "  </a>";
		poolList += "</li>";
		if (currentPool === value.id) {
			coinLogo = "<img style='width:40px' src='img/coin/icon/" + value.coin.type.toLowerCase() + ".png' />";
			coinName = value.coin.name;
			if (typeof coinName === "undefined" || coinName === null) {
				coinName = value.coin.type;
			} 
		}
      });
      poolList += "</ul>";
	  
      if (poolList.length > 0) {
        $(".coin-list-header").html(poolList);
      }
	  
	  var sidebarList = "";
	  const sidebarTemplate = $(".sidebar-template").html();
      sidebarList += sidebarTemplate
		.replace(/{{ coinId }}/g, currentPool)
		.replace(/{{ coinLogo }}/g, coinLogo)
		.replace(/{{ coinName }}/g, coinName)
      $(".sidebar-wrapper").html(sidebarList);
  
      $("a.link").each(function() {
	    if (localStorage[currentPool + "-walletAddress"] && this.href.indexOf("/dashboard") > 0)
	    {
		  this.href = "#" + currentPool + "/dashboard?address=" + localStorage[currentPool + "-walletAddress"];
	    } 
      });

    })
    .fail(function() {
      $.notify(
        {
          message: "Error: No response from API.<br>(loadNavigation)"
        },
        {
          type: "danger",
          timer: 3000
        }
      );
    });
}
