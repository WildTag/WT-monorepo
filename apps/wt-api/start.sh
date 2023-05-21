
#!/bin/bash

if [ -d "venv" ]
then
    echo "venv found."
else
    echo "creating venv."
    python3 -m venv venv
fi

source ./venv/bin/activate
pip3 install -r ./requirements.txt
prisma generate
prisma db push
python3 ./main.py
