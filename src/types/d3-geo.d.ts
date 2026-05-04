declare module "d3-geo" {
    export function geoMercator(): {
        fitSize(size: [number, number], object: any): any;
    };

    export function geoPath(projection?: any): {
        (object: any): string | null;
        centroid(object: any): [number, number];
    };
}

