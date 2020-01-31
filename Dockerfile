FROM pytorch/pytorch

CMD ["bash"]

WORKDIR /workspace

RUN apt-get update
RUN apt-get -y install vim
RUN apt-get install -y wget
RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash -
RUN apt-get -y install nodejs
#RUN git clone https://github.com/parkhojun/ainized-PyTorch-Multi-Style-Transfer.git
#WORKDIR ./experiments
RUN pip install --upgrade pip
RUN pip install opencv-python==3.4.8.29
RUN apt-get install -y libglib2.0-0
RUN apt-get install -y libsm6 libxext6 libxrender-dev
RUN pip install torchfile

RUN rm -rf node_modules && npm install

COPY package.json .
RUN npm install
RUN npm install sync-exec

COPY . .
WORKDIR ./experiments
RUN bash models/download_model.sh
EXPOSE 80
ENTRYPOINT npm start

