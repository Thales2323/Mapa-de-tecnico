// Inicializar o mapa
var map = L.map('map').setView([-14.235, -51.925], 4); // Coordenadas aproximadas para centralizar o mapa no Brasil

// Definir um limite de visualização para o Brasil
var southWest = L.latLng(-33.8, -73.0), // Coordenadas sudoeste do Brasil
    northEast = L.latLng(5.3, -34.7),   // Coordenadas nordeste do Brasil
    bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds); // Define o limite de visualização
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Array para armazenar os marcadores cadastrados
var marcadores = [];

// Carregar marcadores do localStorage, se houver
carregarMarcadores();

// Função para adicionar marcador ao mapa
function adicionarMarcador(nome, cidade) {
    var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(cidade);
    axios.get(url)
        .then(function(response) {
            var result = response.data[0];
            if (result) {
                var lat = result.lat;
                var lon = result.lon;
                var endereco = result.display_name;

                // Criar marcador com base nas coordenadas
                var marker = L.marker([lat, lon]).addTo(map).bindPopup(nome + '<br>' + endereco);
                marcadores.push({ nome: nome, cidade: cidade }); // Adicionar ao array de marcadores

                // Atualizar a tabela de marcadores
                var corpoTabela = document.getElementById('corpoTabela');
                var linha = `<tr><td>${nome}</td><td>${cidade}</td><td><button class="botaoExcluir" onclick="removerMarcador('${nome}', '${cidade}')">Excluir</button></td></tr>`;
                corpoTabela.insertAdjacentHTML('beforeend', linha);

                // Salvar marcadores no localStorage
                localStorage.setItem('marcadores', JSON.stringify(marcadores));
            } else {
                console.error('Local não encontrado para o endereço fornecido:', cidade);
            }
        })
        .catch(function(error) {
            console.error('Erro ao obter os dados do endereço:', error);
        });
}

// Função para carregar marcadores do localStorage
function carregarMarcadores() {
    var marcadoresSalvos = JSON.parse(localStorage.getItem('marcadores'));
    if (marcadoresSalvos) {
        marcadoresSalvos.forEach(function(marcador) {
            adicionarMarcador(marcador.nome, marcador.cidade);
        });
    }
}

// Evento de submissão do formulário
document.getElementById('cadastroForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o envio do formulário

    // Obter os valores do formulário
    var nome = document.getElementById('nome').value;
    var cidade = document.getElementById('cidade').value;

    // Adicionar marcador ao mapa
    adicionarMarcador(nome, cidade);

    // Limpar campos do formulário
    document.getElementById('nome').value = '';
    document.getElementById('cidade').value = '';
});

// Função para exibir mensagem de sucesso
function mostrarMensagemSucesso(mensagem) {
    var mensagemSucesso = document.createElement('div');
    mensagemSucesso.textContent = mensagem;
    mensagemSucesso.style.color = 'green';
    document.body.appendChild(mensagemSucesso);
    setTimeout(function() {
        mensagemSucesso.remove();
    }, 3000); // Remove a mensagem após 3 segundos
}

// Função para exibir mensagem de erro
function mostrarMensagemErro(mensagem) {
    var mensagemErro = document.createElement('div');
    mensagemErro.textContent = mensagem;
    mensagemErro.style.color = 'red';
    document.body.appendChild(mensagemErro);
    setTimeout(function() {
        mensagemErro.remove();
    }, 3000); // Remove a mensagem após 3 segundos
}

// Função para remover um marcador da tabela e do mapa
function removerMarcador(nome, cidade) {
    // Remova o marcador do mapa
    for (var i = 0; i < map._layers.length; i++) {
        if (map._layers[i]._popup && map._layers[i]._popup._content.includes(nome)) {
            map.removeLayer(map._layers[i]);
        }
    }
    
    // Remova o marcador da tabela
    var tbody = document.getElementById("corpoTabela");
    var linhas = tbody.getElementsByTagName("tr");
    for (var i = 0; i < linhas.length; i++) {
        var colunas = linhas[i].getElementsByTagName("td");
        if (colunas[0].textContent === nome && colunas[1].textContent === cidade) {
            tbody.removeChild(linhas[i]);
            break;
        }
    }
    // Atualize o array de marcadores removendo o marcador excluído
    marcadores = marcadores.filter(function(marcador) {
        return marcador.nome !== nome || marcador.cidade !== cidade;
    });
    // Salve o array de marcadores atualizado no localStorage
    localStorage.setItem('marcadores', JSON.stringify(marcadores));
}