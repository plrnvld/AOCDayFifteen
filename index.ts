import * as fs from 'fs';
import * as rd from 'readline'

var reader = rd.createInterface(fs.createReadStream("Input.txt"))

var data: Array<string> = [];
reader.on("line", (l: string) => {
    data.push(l);
})

reader.on("close", ()=> {
    console.log(`Data has been read: ${data.length} lines.` );
    
    let path_vertex = find_path();

    if (path_vertex) {
        let path_reversed: Array<Vertex> = [];

        var node: Vertex | null = path_vertex;
        while (node) {
            path_reversed.push(node);
            node = node.prev;
        }

        let path = path_reversed.reverse();

        let total_risk = path.reduce((sum, node) => sum + node.risk, 0) - path[0].risk;
        console.log(`Path length: ${path.length} with total risk ${total_risk}`);
        
    } else {
        console.log(`No path found`);
    }
})

function get_risk(x: number, y: number): number {
    return Number(data[y][x]);
}

function find_path(): Vertex | null {
    let original_vertices: Set<Vertex> = new Set();
   
    data.forEach((line, y) => {
        for (var x = 0; x < line.length; x++) {
            original_vertices.add(new Vertex(x, y, get_risk(x, y)));
        }
    });

    let vertices = enlarge_map(original_vertices);

    console.log(`Map enlarged, now: ${vertices.size} vertices.` );

    let source = find_vertex(0, 0);
    if (source) {
        source.dist = 0;
    }

    let target = find_vertex(499, 499);

    while (vertices.size !== 0) {
        if (vertices.size % 200 === 0) {
            let percentage = (100 - (100 * vertices.size / 250000));
            console.log(`Progress ${ Math.round(percentage * 10) / 10 } %`);
        }

        let u = find_min_distance_vertex();
        vertices.delete(u);

        if (u === target)
            return u;

        let neighbours = find_neighbours(u);
        for (let v of neighbours) {
            let alt = u.dist + v.risk;

            if (alt < v.dist) {
                v.dist = alt;
                v.prev = u;
            }
        }
    }
    

    function find_min_distance_vertex(): Vertex {
        let first_vertex = vertices.values().next().value;
        var min_dist: number = first_vertex.dist;
        var min_dist_vertex = first_vertex;

        for (let v of vertices) {
            if (v.dist < min_dist) {
                min_dist = v.dist;
                min_dist_vertex = v;
            }
        }

        return min_dist_vertex;
    }

    function find_neighbours(vertex: Vertex): Array<Vertex> {
        let neighbours: Array<Vertex> = [];

        let x = vertex.x;
        let y = vertex.y;

        add_neighbour(x - 1, y);
        add_neighbour(x + 1, y);
        add_neighbour(x, y - 1);
        add_neighbour(x, y + 1);

        function add_neighbour(x: number, y: number): void {
            let neighbour = find_vertex(x, y);
            if (neighbour) {
                neighbours.push(neighbour);
            }
        }

        return neighbours;
    }

    function find_vertex(x: number, y: number): Vertex | null {
        for (let v of vertices) {
            if (v.x === x && v.y === y)
                return v;
        }

        return null;
    }

    return null;
}

function enlarge_map(vertices: Set<Vertex>): Set<Vertex> {
    let new_map: Set<Vertex> = new Set();

    for (let v of vertices) {
        for (let d of get_vertex_duplicates(v)) {
            new_map.add(d);
        }
    }

    function get_vertex_duplicates(vertex: Vertex) {
        let duplicates: Array<Vertex> = [];
        let original_risk = vertex.risk;

        duplicates.push(vertex);

        for (var y = 0; y < 5; y++) { 
            for (var x = 0; x < 5; x++) {
                if (!(x === 0 && y === 0)) {
                    let new_x = x * 100 + x;
                    let new_y = y * 100 + y;
                    let risk_addition = x + y;
                    var new_risk = original_risk + risk_addition;
                    if (new_risk > 9) {
                        new_risk -= 9;
                    }

                    duplicates.push(new Vertex(new_x, new_y, new_risk));
                }
            }
        }      

        return duplicates;
    }

    return new_map;
}

class Vertex {
    x: number;
    y: number;
    dist: number;
    risk: number;
    prev: Vertex | null;
     
    constructor(x: number, y: number, risk: number) {
        this.x = x;
        this.y = y;
        this.dist = Number.MAX_SAFE_INTEGER;
        this.risk = risk;
        this.prev = null;
    }
}