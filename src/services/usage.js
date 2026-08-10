const usage = new Map();

export function recordUsage(apiKey, data={}){

    const current = usage.get(apiKey) || {
        requests:0,
        tokens:0
    };

    current.requests++;
    current.tokens += data.tokens || 0;

    usage.set(apiKey,current);

    return current;
}

export function getUsage(apiKey){
    return usage.get(apiKey) || {
        requests:0,
        tokens:0
    };
}
