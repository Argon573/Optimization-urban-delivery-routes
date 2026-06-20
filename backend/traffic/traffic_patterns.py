STREETS = [
    {
        "name": "ул. Малышева (центр)",
        "from_id": 845815409,
        "to_id": 668987103,
        "base_speed": 40,
        "patterns": [
            {"days": [0, 1, 2, 3, 4], "hours": [[8, 10], [17, 19]], "factor": 0.25},
            {"days": [5, 6], "hours": [[11, 16]], "factor": 0.5},
        ],
    },
    {
        "name": "ул. Малышева (центр, обратно)",
        "from_id": 668987103,
        "to_id": 845815409,
        "base_speed": 40,
        "patterns": [
            {"days": [0, 1, 2, 3, 4], "hours": [[8, 10], [17, 19]], "factor": 0.25},
            {"days": [5, 6], "hours": [[11, 16]], "factor": 0.5},
        ],
    },
    {
        "name": "пр. Ленина (центр)",
        "from_id": 1614180960,
        "to_id": 800831478,
        "base_speed": 50,
        "patterns": [
            {"days": [0, 1, 2, 3, 4, 5, 6], "hours": [[7, 22]], "factor": 0.4},
        ],
    },
    {
        "name": "пр. Ленина (центр, обратно)",
        "from_id": 800831478,
        "to_id": 1614180960,
        "base_speed": 50,
        "patterns": [
            {"days": [0, 1, 2, 3, 4, 5, 6], "hours": [[7, 22]], "factor": 0.4},
        ],
    },
    {
        "name": "ул. Московская",
        "from_id": 668987103,
        "to_id": 951482827,
        "base_speed": 45,
        "patterns": [
            {"days": [0, 1, 2, 3, 4], "hours": [[7, 10], [17, 19]], "factor": 0.333},
        ],
    },
    {
        "name": "ул. Московская (обратно)",
        "from_id": 951482827,
        "to_id": 668987103,
        "base_speed": 45,
        "patterns": [
            {"days": [0, 1, 2, 3, 4], "hours": [[7, 10], [17, 19]], "factor": 0.333},
        ],
    },
    {
        "name": "ул. 8 Марта",
        "from_id": 800831478,
        "to_id": 638345789,
        "base_speed": 45,
        "patterns": [
            {"days": [5, 6], "hours": [[11, 18]], "factor": 0.5},
        ],
    },
    {
        "name": "ул. 8 Марта (обратно)",
        "from_id": 638345789,
        "to_id": 800831478,
        "base_speed": 45,
        "patterns": [
            {"days": [5, 6], "hours": [[11, 18]], "factor": 0.5},
        ],
    },
    {
        "name": "ул. Белинского",
        "from_id": 951482827,
        "to_id": 845815409,
        "base_speed": 45,
        "patterns": [
            {"days": [0, 1, 2, 3, 4], "hours": [[8, 10], [17, 19]], "factor": 0.4},
        ],
    },
    {
        "name": "ул. Белинского (обратно)",
        "from_id": 845815409,
        "to_id": 951482827,
        "base_speed": 45,
        "patterns": [
            {"days": [0, 1, 2, 3, 4], "hours": [[8, 10], [17, 19]], "factor": 0.4},
        ],
    },
    {
        "name": "ул. Щорса (выезд)",
        "from_id": 638345789,
        "to_id": 1614180960,
        "base_speed": 50,
        "patterns": [
            {"days": [0, 1, 2, 3, 4], "hours": [[17, 20]], "factor": 0.25},
        ],
    },
    {
        "name": "ул. Щорса (обратно)",
        "from_id": 1614180960,
        "to_id": 638345789,
        "base_speed": 50,
        "patterns": [
            {"days": [0, 1, 2, 3, 4], "hours": [[17, 20]], "factor": 0.25},
        ],
    },
]
