// Render an ISO timestamp as dd.mm.yyyy hh:mm in local time. Shared by the raw
// table display and the CSV/XLSX export so both show identical values.
const pad = (value: number) => {
    return String(value).padStart(2, '0');
};

export const formatDateTime = (iso: string): string => {
    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
        return iso;
    }

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${day}.${month}.${year} ${hours}:${minutes}`;
};
