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
    .domain([3000, 300])
    .range([0, width]);
svg.append("g")
    .call(d3.axisTop(x));

var y = d3.scaleLinear()
    .domain([1000, 100])
    .range([height, 0]);
svg.append("g")
    .attr("transform", `translate(${width}, 0)`)
    .call(d3.axisRight(y));

var t = d3.transition()
    .duration(750)

vowels = [
    ['i', 240, 2400],
    ['y', 235, 2100],
    ['e', 390, 2300],
    ['ø', 370, 1900],
    ['ɛ', 610, 1900],
    ['œ', 585, 1710],
    ['a', 850, 1610],
    ['ɶ', 820, 1530],
    ['ɑ', 750, 940],
    ['ɒ', 700, 760],
    ['ʌ', 600, 1170],
    ['ɔ', 500, 700],
    ['ɤ', 460, 1310],
    ['o', 360, 640],
    ['ɯ', 300, 1390],
    ['u', 250, 595]
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
    str += "jhajhf"
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

d3.tsv("data.txt").then(function(data) {
    var g = svg.append("g")
    var g2 = svg.append("g")
    var res = []
    var cur = {}
    for (var i = 0; i < data.length; i++) {
        if (data[i].environment != "") {
            if (i != 0) res.push(cur)
            cur = {'env': data[i].environment, 'data': []}
        }
        else {
            cur.data.push(data[i])
        }
    }
    res.push(cur)
    res.forEach((elem, i) => {
        var len = elem.data[elem.data.length - 1].Time_s - elem.data[0].Time_s
        var word = elem.env
        var style = word.replace(/_(.*?)_/g, '<span style="color: blue">$1</span>')
        var vowel = word.match(/_.*?_/g)[0]
        // if (vowel != '_a_' && vowel != '_o_') return
        var sum_f1 = 0, sum_f2 = 0;
        elem.data.forEach((d, i) => {
            sum_f1 += parseFloat(d.F1_Hz)
            sum_f2 += parseFloat(d.F2_Hz)
            g.append("circle")
                .attr("class", "data-" + word)
                .attr("data-time", d.Time_s - elem.data[0].Time_s)
                .attr("cx", x(d.F2_Hz))
                .attr("cy", y(d.F1_Hz))
                .attr("r", 3)
                .attr("fill", stringToColour(vowel))
                .attr("opacity", 0.1)
            if (i != 0) {
                g.append("line")
                    .attr("class", "data-" + word)
                    .attr("data-time", d.Time_s - elem.data[0].Time_s)
                    .attr("x1", x(last.F2_Hz))
                    .attr("y1", y(last.F1_Hz))
                    .attr("x2", x(d.F2_Hz))
                    .attr("y2", y(d.F1_Hz))
                    .attr("stroke-width", 0.5)
                    .attr("stroke", stringToColour(vowel))
                    .attr("opacity", 0.1)
            }
            last = d
        })
        if (vowel.length != 3) {
            g2.append("circle")
                .attr("class", "data-" + word)
                .attr("cx", x(elem.data[elem.data.length - 1].F2_Hz))
                .attr("cy", y(elem.data[elem.data.length - 1].F1_Hz))
                .attr("r", 10 * Math.sqrt(len / 0.2))
                .attr("fill", stringToColour(vowel))
                .attr("stroke", "black")
                .attr("stroke-width", 1)
            g2.append("circle")
                .attr("class", "data-" + word)
                .attr("cx", x(elem.data[0].F2_Hz))
                .attr("cy", y(elem.data[0].F1_Hz))
                .attr("r", 10 * Math.sqrt(len / 0.2))
                .attr("fill", stringToColour(vowel))
                .attr("stroke", "black")
                .attr("stroke-width", 1)
            g.append("line")
                .attr("class", "data-" + word)
                .attr("x1", x(elem.data[0].F2_Hz))
                .attr("y1", y(elem.data[0].F1_Hz))
                .attr("x2", x(elem.data[elem.data.length - 1].F2_Hz))
                .attr("y2", y(elem.data[elem.data.length - 1].F1_Hz))
                .attr("stroke-width", 5)
                .attr("stroke", stringToColour(vowel))
        }
        else {
            g2.append("circle")
                .attr("class", "data-" + word)
                .attr("cx", x(sum_f2 / elem.data.length))
                .attr("cy", y(sum_f1 / elem.data.length))
                .attr("r", 10 * Math.sqrt(len / 0.2))
                .attr("fill", stringToColour(vowel))
                .attr("stroke", "black")
                .attr("stroke-width", 1)
            console.log(vowel, word, sum_f1 / elem.data.length, sum_f2 / elem.data.length, len)
        }
        svg.selectAll(".data-" + word)
            .on("mouseover", d => {
                d3.select("h1").html(style + ' (' + Math.round(len * 1000) + ' ms)')
                d3.selectAll("circle").style("opacity", 0.1)
                d3.selectAll("line").style("opacity", 0.1)
                d3.selectAll(".data-" + word).style("opacity", 1)
            })
            .on("mouseout", d => {
                d3.selectAll("*").style("opacity", null)
                d3.select("h1").html("")
            })
    })

})