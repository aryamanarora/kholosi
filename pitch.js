function kde(kernel, thresholds, data) {
    return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
}

function epanechnikov(bandwidth) {
    return x => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
}

var margin = {top: 50, right: 50, bottom: 50, left: 50}
var width = window.innerWidth - margin.right - margin.left,
    height = window.innerHeight - margin.top - margin.bottom;
var container = d3.select("#map")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)

var svg = container.append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")

var x = d3.scaleLinear()
    .domain([80, 190])
    .range([0, width]);
// var x = d3.scaleLinear()
//     .domain([3600, 2000])
//     .range([0, width]);
svg.append("g")
    .call(d3.axisTop(x));

var y = d3.scaleLinear()
    .domain([80, 190])
    .range([height, 0]);
svg.append("g")
    .attr("transform", `translate(${width}, 0)`)
    .call(d3.axisRight(y));
svg.append("text")
    .attr("text-anchor", "start")
    .attr("x", 0)
    .attr("y", 20)
    .text("Start pitch (Hz)");
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "start")
    .attr("y", width - 20)
    .attr("x", -height)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("End pitch (Hz)");

var t = d3.transition()
    .duration(750)

vowels = [
    // ['i', 240, 2400],
    // ['y', 235, 2100],
    // ['e', 390, 2300],
    // ['ø', 370, 1900],
    // ['ɛ', 610, 1900],
    // ['œ', 585, 1710],
    // ['a', 850, 1610],
    // ['ɶ', 820, 1530],
    // ['ɑ', 750, 940],
    // ['ɒ', 700, 760],
    // ['ʌ', 600, 1170],
    // ['ɔ', 500, 700],
    // ['ɤ', 460, 1310],
    // ['o', 360, 640],
    // ['ɯ', 300, 1390],
    // ['u', 250, 595]
]

vowels.forEach(d => {
    svg.append("text")
        .text(d[0])
        .attr("x", x(d[2]))
        .attr("y", y(d[1]))
        .style("font-size", 30)
        .style("font-family", "Noto Sans")
})

var stringToColour = function(str) {
    str += "asdas"
    try {
        var hash = 0
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 4) - hash)
        }
        var colour = '#'
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF
            colour += ('00' + value.toString(16)).substr(-2)
        }
        return colour
    }
    catch {
        return "0"
    }
}

d3.tsv("pitch.txt").then(function(data) {
    var sums = {}, counts = {}
    var g = svg.append("g")
    var g2 = svg.append("g")
    var res = []
    var cur = {}
    for (var i = 0; i < data.length; i++) {
        if (data[i].type != "") {
            if (i != 0) res.push(cur)
            cur = {'env': data[i].environment, 'type': data[i].type, 'data': []}
        }
        else {
            cur.data.push(data[i])
        }
    }
    res.push(cur)
    f1s = {}
    f2s = {}
    lens = {}
    for (var i = 0; i <= 80; i += 10) {
        g.append("line")
            .attr("x1", x(80 + i))
            .attr("y1", y(80))
            .attr("x2", x(190))
            .attr("y2", y(190 - i))
            .attr("stroke", "black")
            .attr("stroke-dasharray", "4")
    }
    
    res.forEach((elem, i) => {
        var len = elem.data[elem.data.length - 1].Time_s - elem.data[0].Time_s
        var word = elem.env
        for (var j = 0; j <= elem.data.length - 4; j += 2) {
            console.log(elem)
            // g.append("circle")
            //     .attr("cx", x(elem.data[j].F0_Hz))
            //     .attr("cy", y(elem.data[j + 1].F0_Hz))
            //     .attr("r", Math.sqrt(elem.data[j].environment / elem.data[j].environment) * 10)
            //     .attr("fill", stringToColour(elem.type))
            //     .attr("id", word)
            //     .on("mouseover", function() {
            //         g.selectAll("line, circle").attr("opacity", 0.2)
            //         d3.selectAll("#" + d3.select(this).attr("id")).attr("opacity", 1)
            //         d3.select("div")
            //             .html("<h1>" + d3.select(this).attr("id") + "</h1>")
            //     })
            //     .on("mouseout", function() {
            //         g.selectAll("line, circle").attr("opacity", null)
            //         d3.select("div")
            //             .html("")
            //     })
            // g.append("circle")
            //     .attr("cx", x(elem.data[j + 2].F0_Hz))
            //     .attr("cy", y(elem.data[j + 3].F0_Hz))
            //     .attr("r", Math.sqrt(elem.data[j + 2].environment / elem.data[j].environment) * 10)
            //     .attr("fill", stringToColour(elem.type))
            //     .attr("id", word)
            //     .on("mouseover", function() {
            //         g.selectAll("line, circle").attr("opacity", 0.2)
            //         d3.selectAll("#" + d3.select(this).attr("id")).attr("opacity", 1)
            //         d3.select("div")
            //             .html("<h1>" + d3.select(this).attr("id") + "</h1>")
            //     })
            //     .on("mouseout", function() {
            //         g.selectAll("line, circle").attr("opacity", null)
            //         d3.select("div")
            //             .html("")
            //     })
            g.append("line")
                // .attr("x1", x(120))
                // .attr("y1", y(120))
                // .attr("x2", x(elem.data[j + 2].F0_Hz - elem.data[j].F0_Hz + 120))
                // .attr("y2", y(elem.data[j + 3].F0_Hz - elem.data[j + 1].F0_Hz + 120))
                .attr("x1", x(elem.data[j].F0_Hz))
                .attr("y1", y(elem.data[j + 1].F0_Hz))
                .attr("x2", x(elem.data[j + 2].F0_Hz))
                .attr("y2", y(elem.data[j + 3].F0_Hz))
                .attr("stroke", stringToColour(elem.type))
                .attr("stroke-width", 1.5)
                .attr("id", word)
                .attr("marker-end", "url(#arrowhead)")
                .on("mouseover", function() {
                    g.selectAll("line, circle").attr("opacity", 0.2)
                    d3.selectAll("#" + d3.select(this).attr("id")).attr("opacity", 1)
                    d3.select("div")
                        .html("<h1>" + d3.select(this).attr("id") + "</h1>")
                })
                .on("mouseout", function() {
                    g.selectAll("line, circle").attr("opacity", null)
                    d3.select("div")
                        .html("")
                })
            }
    })
})